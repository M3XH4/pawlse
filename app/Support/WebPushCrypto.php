<?php

namespace App\Support;

use InvalidArgumentException;
use OpenSSLAsymmetricKey;
use RuntimeException;

class WebPushCrypto
{
    private const P256_SPKI_PREFIX_HEX = '3059301306072a8648ce3d020106082a8648ce3d030107034200';

    /**
     * Generate a new VAPID ECDSA P-256 key pair encoded in unpadded base64url.
     *
     * @return array{publicKey: string, privateKey: string}
     */
    public static function generateVapidKeys(): array
    {
        $resource = self::createEcKeyPair();
        $details = openssl_pkey_get_details($resource);
        if (! is_array($details) || ! isset($details['ec']['x'], $details['ec']['y'], $details['ec']['d'])) {
            throw new RuntimeException('OpenSSL failed to export EC key parameters.');
        }

        $x = str_pad($details['ec']['x'], 32, "\x00", STR_PAD_LEFT);
        $y = str_pad($details['ec']['y'], 32, "\x00", STR_PAD_LEFT);
        $d = str_pad($details['ec']['d'], 32, "\x00", STR_PAD_LEFT);

        return [
            'publicKey' => self::base64UrlEncode("\x04".$x.$y),
            'privateKey' => self::base64UrlEncode($d),
        ];
    }

    /**
     * Encrypt a JSON/text payload according to RFC 8291 (aes128gcm).
     *
     * @return array{ciphertext: string, salt: string, localPublicKey: string}
     */
    public static function encryptPayload(
        string $payload,
        string $userPublicKeyBase64Url,
        string $userAuthTokenBase64Url,
    ): array {
        $uaPublic = self::base64UrlDecode($userPublicKeyBase64Url);
        if (strlen($uaPublic) !== 65 || $uaPublic[0] !== "\x04") {
            throw new InvalidArgumentException('Invalid client p256dh public key.');
        }

        $authSecret = self::base64UrlDecode($userAuthTokenBase64Url);
        if ($authSecret === '' || strlen($authSecret) < 16) {
            throw new InvalidArgumentException('Invalid client auth secret.');
        }

        $localKey = self::createEcKeyPair();

        $localDetails = openssl_pkey_get_details($localKey);
        if (! is_array($localDetails) || ! isset($localDetails['ec']['x'], $localDetails['ec']['y'])) {
            throw new RuntimeException('Unable to extract ephemeral public key.');
        }

        $asPublic = "\x04"
            .str_pad($localDetails['ec']['x'], 32, "\x00", STR_PAD_LEFT)
            .str_pad($localDetails['ec']['y'], 32, "\x00", STR_PAD_LEFT);

        $uaPublicResource = self::publicKeyFromRaw($uaPublic);
        $sharedSecret = openssl_pkey_derive($uaPublicResource, $localKey, 32);

        if (! is_string($sharedSecret) || $sharedSecret === '') {
            throw new RuntimeException('ECDH shared secret derivation failed.');
        }

        $sharedSecret = str_pad($sharedSecret, 32, "\x00", STR_PAD_LEFT);
        $salt = random_bytes(16);

        $keyInfo = "WebPush: info\x00".$uaPublic.$asPublic;
        $ikm = hash_hkdf('sha256', $sharedSecret, 32, $keyInfo, $authSecret);
        $cek = hash_hkdf('sha256', $ikm, 16, "Content-Encoding: aes128gcm\x00", $salt);
        $nonce = hash_hkdf('sha256', $ikm, 12, "Content-Encoding: nonce\x00", $salt);

        $paddedPlaintext = $payload."\x02";
        $tag = '';
        $encrypted = openssl_encrypt(
            $paddedPlaintext,
            'aes-128-gcm',
            $cek,
            OPENSSL_RAW_DATA,
            $nonce,
            $tag,
            '',
            16,
        );

        if (! is_string($encrypted) || strlen($tag) !== 16) {
            throw new RuntimeException('AES-128-GCM payload encryption failed.');
        }

        $recordSize = 4096;
        $header = $salt.pack('N', $recordSize).chr(strlen($asPublic)).$asPublic;

        return [
            'ciphertext' => $header.$encrypted.$tag,
            'salt' => $salt,
            'localPublicKey' => $asPublic,
        ];
    }

    /**
     * Build the RFC 8292 Authorization header (`vapid t=..., k=...`).
     */
    public static function createVapidAuthorizationHeader(
        string $endpoint,
        string $subject,
        string $vapidPublicKey,
        string $vapidPrivateKey,
        int $ttlSeconds = 43200,
    ): string {
        $parsed = parse_url($endpoint);
        if (! is_array($parsed) || ! isset($parsed['scheme'], $parsed['host'])) {
            throw new InvalidArgumentException('Invalid push subscription endpoint URL.');
        }

        $audience = $parsed['scheme'].'://'.$parsed['host'];
        if (isset($parsed['port'])) {
            $audience .= ':'.$parsed['port'];
        }

        $headerSegment = self::base64UrlEncode(json_encode([
            'typ' => 'JWT',
            'alg' => 'ES256',
        ], JSON_THROW_ON_ERROR));

        $payloadSegment = self::base64UrlEncode(json_encode([
            'aud' => $audience,
            'exp' => time() + $ttlSeconds,
            'sub' => $subject,
        ], JSON_THROW_ON_ERROR));

        $signingInput = $headerSegment.'.'.$payloadSegment;
        $privateKey = self::privateKeyFromRaw($vapidPublicKey, $vapidPrivateKey);

        $derSignature = '';
        if (! openssl_sign($signingInput, $derSignature, $privateKey, OPENSSL_ALGO_SHA256)) {
            throw new RuntimeException('Unable to sign VAPID JWT.');
        }

        $rawSignature = self::derToP1363($derSignature, 32);
        $jwt = $signingInput.'.'.self::base64UrlEncode($rawSignature);

        return 'vapid t='.$jwt.', k='.$vapidPublicKey;
    }

    public static function base64UrlEncode(string $binary): string
    {
        return rtrim(strtr(base64_encode($binary), '+/', '-_'), '=');
    }

    public static function base64UrlDecode(string $encoded): string
    {
        $normalized = strtr(trim($encoded), '-_', '+/');
        $padding = strlen($normalized) % 4;
        if ($padding !== 0) {
            $normalized .= str_repeat('=', 4 - $padding);
        }

        $decoded = base64_decode($normalized, true);
        if (! is_string($decoded)) {
            throw new InvalidArgumentException('Invalid base64url input.');
        }

        return $decoded;
    }

    private static function publicKeyFromRaw(string $rawUncompressedKey): OpenSSLAsymmetricKey
    {
        $der = hex2bin(self::P256_SPKI_PREFIX_HEX).$rawUncompressedKey;
        $pem = "-----BEGIN PUBLIC KEY-----\n"
            .chunk_split(base64_encode($der), 64, "\n")
            ."-----END PUBLIC KEY-----\n";

        $key = openssl_pkey_get_public($pem);
        if (! $key instanceof OpenSSLAsymmetricKey) {
            throw new RuntimeException('Unable to load peer EC public key.');
        }

        return $key;
    }

    private static function privateKeyFromRaw(string $vapidPublicKey, string $vapidPrivateKey): OpenSSLAsymmetricKey
    {
        $publicBinary = self::base64UrlDecode($vapidPublicKey);
        $privateBinary = self::base64UrlDecode($vapidPrivateKey);

        if (strlen($publicBinary) !== 65 || strlen($privateBinary) !== 32) {
            throw new InvalidArgumentException('Invalid VAPID key lengths.');
        }

        // SEC1 ECPrivateKey ASN.1 structure for prime256v1
        $oidPrime256v1 = hex2bin('06082a8648ce3d030107');
        $version = hex2bin('020101');
        $privateOctet = "\x04".chr(32).$privateBinary;
        $paramsTag = "\xa0".chr(strlen($oidPrime256v1)).$oidPrime256v1;
        $pubBitString = "\x03".chr(strlen($publicBinary) + 1)."\x00".$publicBinary;
        $pubTag = "\xa1".chr(strlen($pubBitString)).$pubBitString;

        $inner = $version.$privateOctet.$paramsTag.$pubTag;
        $der = "\x30".self::encodeAsn1Length(strlen($inner)).$inner;

        $pem = "-----BEGIN EC PRIVATE KEY-----\n"
            .chunk_split(base64_encode($der), 64, "\n")
            ."-----END EC PRIVATE KEY-----\n";

        $key = openssl_pkey_get_private($pem);
        if (! $key instanceof OpenSSLAsymmetricKey) {
            throw new RuntimeException('Unable to load VAPID EC private key.');
        }

        return $key;
    }

    private static function encodeAsn1Length(int $length): string
    {
        if ($length < 0x80) {
            return chr($length);
        }

        $packed = ltrim(pack('N', $length), "\x00");

        return chr(0x80 | strlen($packed)).$packed;
    }

    /**
     * Convert an OpenSSL DER ECDSA signature into raw IEEE P1363 (r || s).
     */
    private static function derToP1363(string $der, int $componentSize): string
    {
        $offset = 0;
        if (ord($der[$offset++]) !== 0x30) {
            throw new RuntimeException('Invalid DER signature sequence.');
        }

        $seqLen = ord($der[$offset++]);
        if (($seqLen & 0x80) !== 0) {
            $offset += ($seqLen & 0x7F);
        }

        $r = self::readDerInteger($der, $offset, $componentSize);
        $s = self::readDerInteger($der, $offset, $componentSize);

        return $r.$s;
    }

    private static function readDerInteger(string $der, int &$offset, int $componentSize): string
    {
        if (ord($der[$offset++]) !== 0x02) {
            throw new RuntimeException('Invalid DER integer tag.');
        }

        $length = ord($der[$offset++]);
        $value = substr($der, $offset, $length);
        $offset += $length;

        $value = ltrim($value, "\x00");
        if (strlen($value) > $componentSize) {
            throw new RuntimeException('ECDSA signature component exceeds curve byte length.');
        }

        return str_pad($value, $componentSize, "\x00", STR_PAD_LEFT);
    }

    private static function createEcKeyPair(): OpenSSLAsymmetricKey
    {
        $options = [
            'curve_name' => 'prime256v1',
            'private_key_type' => OPENSSL_KEYTYPE_EC,
        ];

        $resource = @openssl_pkey_new($options);
        if ($resource instanceof OpenSSLAsymmetricKey) {
            return $resource;
        }

        // Windows PHP without OPENSSL_CONF requires an explicit config path for openssl_pkey_new.
        while (openssl_error_string() !== false) {
            // Drain stale OpenSSL errors before fallback attempt.
        }

        $tempConfig = tempnam(sys_get_temp_dir(), 'pawlse_ocnf_');
        if ($tempConfig !== false) {
            try {
                file_put_contents($tempConfig, "[req]\ndistinguished_name=dn\n[dn]\n");
                $resource = @openssl_pkey_new([
                    ...$options,
                    'config' => $tempConfig,
                ]);
            } finally {
                @unlink($tempConfig);
            }
        }

        if (! $resource instanceof OpenSSLAsymmetricKey) {
            throw new RuntimeException('Unable to generate P-256 EC key pair via OpenSSL.');
        }

        return $resource;
    }
}
