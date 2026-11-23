<?php

namespace App\Services\Donations;

use Illuminate\Support\Facades\Process;

class ReceiptOcrService
{
    /**
     * Extract reference number and amount received from a receipt image file.
     *
     * @return array{reference_no: string|null, amount_received: float|null, raw_text: string}
     */
    public function extractFromPath(string $absolutePath): array
    {
        $rawText = $this->runOcr($absolutePath);
        $parsed = $this->parseReceiptText($rawText);

        return [
            'reference_no' => $parsed['reference_no'],
            'amount_received' => $parsed['amount_received'],
            'raw_text' => $rawText,
        ];
    }

    /**
     * Parse reference number and amount received from raw OCR text.
     *
     * @return array{reference_no: string|null, amount_received: float|null}
     */
    public function parseReceiptText(string $text): array
    {
        if (trim($text) === '') {
            return [
                'reference_no' => null,
                'amount_received' => null,
            ];
        }

        $referenceNo = $this->extractReferenceNumber($text);
        $amountReceived = $this->extractAmountReceived($text);

        return [
            'reference_no' => $referenceNo,
            'amount_received' => $amountReceived,
        ];
    }

    protected function runOcr(string $absolutePath): string
    {
        if (PHP_OS_FAMILY === 'Windows') {
            $scriptPath = realpath(resource_path('scripts/ocr_receipt.ps1'))
                ?: str_replace('/', DIRECTORY_SEPARATOR, resource_path('scripts/ocr_receipt.ps1'));
            $normalizedImagePath = realpath($absolutePath)
                ?: str_replace('/', DIRECTORY_SEPARATOR, $absolutePath);

            if (file_exists($scriptPath)) {
                $powershellBin = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
                $executable = file_exists($powershellBin) ? $powershellBin : 'powershell';

                $result = Process::timeout(15)->run([
                    $executable,
                    '-NoProfile',
                    '-ExecutionPolicy',
                    'Bypass',
                    '-File',
                    $scriptPath,
                    '-ImagePath',
                    $normalizedImagePath,
                ]);

                if ($result->successful()) {
                    return trim($result->output());
                }
            }
        }

        // Fallback to tesseract CLI if installed on Linux/macOS/Windows
        $tesseract = Process::timeout(15)->run([
            'tesseract',
            $absolutePath,
            'stdout',
            '--psm',
            '6',
        ]);

        if ($tesseract->successful()) {
            return trim($tesseract->output());
        }

        return '';
    }

    private function extractReferenceNumber(string $text): ?string
    {
        // 1. Explicit "Ref No." / "Reference No." label followed by grouped or raw digits/alphanumeric
        $labelPatterns = [
            '/Ref(?:\.|erence)?\s*(?:No\.?|Number|#)?\s*[:\-]?\s*(\d{4}[\s\-]+\d{3,4}[\s\-]+\d{4,6})/i',
            '/Ref(?:\.|erence)?\s*(?:No\.?|Number|#)?\s*[:\-]?\s*(\d{9,16})/i',
            '/Ref(?:\.|erence)?\s*(?:No\.?|Number|#)?\s*[:\-]?\s*([A-Z0-9]{2,6}[\-][A-Z0-9\-]{4,16})/i',
        ];

        foreach ($labelPatterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                return preg_replace('/\s+/', ' ', trim(str_replace('-', ' ', $matches[1])));
            }
        }

        // 2. Fallback: common GCash 13-digit or grouped 4-3-6 / 4-4-5 numbers
        $fallbackPatterns = [
            '/\b(\d{4}\s+\d{3,4}\s+\d{4,6})\b/',
            '/\b(10\d{11})\b/',
            '/\b(MP-?\d{6,12})\b/i',
        ];

        foreach ($fallbackPatterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                return preg_replace('/\s+/', ' ', trim($matches[1]));
            }
        }

        return null;
    }

    private function extractAmountReceived(string $text): ?float
    {
        // Normalize OCR artifacts in decimal amounts like "P250.OO" or "250.O0"
        $normalized = preg_replace_callback(
            '/([₱P]\s*|\b)(\d[\d,]*)\.([0Oo]{2})\b/u',
            static fn (array $m): string => $m[1].$m[2].'.00',
            $text
        ) ?? $text;

        // 1. Prefer "Total Amount Sent" / "Amount Received" / "Total Amount" / "Amount Sent"
        $labeledPatterns = [
            '/(?:Total\s+Amount\s+Sent|Amount\s+Received|Total\s+Amount|Amount\s+Sent)\s*[:\-]?\s*(?:₱|PHP|Php|P)?\s*([\d,]+\.\d{2})/iu',
            '/(?:₱|PHP|Php)\s*([\d,]+\.\d{2})/u',
            '/\bP\s*([\d,]+\.\d{2})\b/',
            '/\bAmount\s*[:\-]?\s*(?:₱|PHP|Php|P)?\s*([\d,]+\.\d{2})/iu',
        ];

        foreach ($labeledPatterns as $pattern) {
            if (preg_match($pattern, $normalized, $matches)) {
                $value = (float) str_replace(',', '', $matches[1]);
                if ($value > 0) {
                    return round($value, 2);
                }
            }
        }

        // 2. Fallback: any standalone currency decimal like 250.00 (excluding gCO2e / dates / times)
        if (preg_match('/\b(\d{1,3}(?:,\d{3})*\.\d{2})\b/', $normalized, $matches)) {
            $value = (float) str_replace(',', '', $matches[1]);
            if ($value > 0) {
                return round($value, 2);
            }
        }

        return null;
    }
}
