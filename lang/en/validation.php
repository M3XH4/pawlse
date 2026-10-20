<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines contain the default error messages used by
    | the validator class. Some of these rules have multiple versions such
    | as the size rules. Feel free to tweak each of these messages here.
    |
    */

    'accepted' => 'The :attribute field must be accepted.',
    'accepted_if' => 'The :attribute field must be accepted when :other is :value.',
    'active_url' => 'The :attribute field must be a valid URL.',
    'after' => 'The :attribute field must be a date after :date.',
    'after_or_equal' => 'The :attribute field must be a date after or equal to :date.',
    'alpha' => 'The :attribute field must only contain letters.',
    'alpha_dash' => 'The :attribute field must only contain letters, numbers, dashes, and underscores.',
    'alpha_num' => 'The :attribute field must only contain letters and numbers.',
    'any_of' => 'The :attribute field is invalid.',
    'array' => 'The :attribute field must be an array.',
    'ascii' => 'The :attribute field must only contain single-byte alphanumeric characters and symbols.',
    'before' => 'The :attribute field must be a date before :date.',
    'before_or_equal' => 'The :attribute field must be a date before or equal to :date.',
    'between' => [
        'array' => 'The :attribute field must have between :min and :max items.',
        'file' => 'The :attribute field must be between :min and :max kilobytes.',
        'numeric' => 'The :attribute field must be between :min and :max.',
        'string' => 'The :attribute field must be between :min and :max characters.',
    ],
    'boolean' => 'The :attribute field must be true or false.',
    'can' => 'The :attribute field contains an unauthorized value.',
    'confirmed' => 'The :attribute field confirmation does not match.',
    'contains' => 'The :attribute field is missing a required value.',
    'current_password' => 'The password is incorrect.',
    'date' => 'The :attribute field must be a valid date.',
    'date_equals' => 'The :attribute field must be a date equal to :date.',
    'date_format' => 'The :attribute field must match the format :format.',
    'decimal' => 'The :attribute field must have :decimal decimal places.',
    'declined' => 'The :attribute field must be declined.',
    'declined_if' => 'The :attribute field must be declined when :other is :value.',
    'different' => 'The :attribute field and :other must be different.',
    'digits' => 'The :attribute field must be :digits digits.',
    'digits_between' => 'The :attribute field must be between :min and :max digits.',
    'dimensions' => 'The :attribute field has invalid image dimensions.',
    'distinct' => 'The :attribute field has a duplicate value.',
    'doesnt_contain' => 'The :attribute field must not contain any of the following: :values.',
    'doesnt_end_with' => 'The :attribute field must not end with one of the following: :values.',
    'doesnt_start_with' => 'The :attribute field must not start with one of the following: :values.',
    'email' => 'The :attribute field must be a valid email address.',
    'encoding' => 'The :attribute field must be encoded in :encoding.',
    'ends_with' => 'The :attribute field must end with one of the following: :values.',
    'enum' => 'The selected :attribute is invalid.',
    'exists' => 'The selected :attribute is invalid.',
    'extensions' => 'The :attribute field must have one of the following extensions: :values.',
    'file' => 'The :attribute field must be a file.',
    'filled' => 'The :attribute field must have a value.',
    'gt' => [
        'array' => 'The :attribute field must have more than :value items.',
        'file' => 'The :attribute field must be greater than :value kilobytes.',
        'numeric' => 'The :attribute field must be greater than :value.',
        'string' => 'The :attribute field must be greater than :value characters.',
    ],
    'gte' => [
        'array' => 'The :attribute field must have :value items or more.',
        'file' => 'The :attribute field must be greater than or equal to :value kilobytes.',
        'numeric' => 'The :attribute field must be greater than or equal to :value.',
        'string' => 'The :attribute field must be greater than or equal to :value characters.',
    ],
    'hex_color' => 'The :attribute field must be a valid hexadecimal color.',
    'image' => 'The :attribute field must be an image.',
    'in' => 'The selected :attribute is invalid.',
    'in_array' => 'The :attribute field must exist in :other.',
    'in_array_keys' => 'The :attribute field must contain at least one of the following keys: :values.',
    'integer' => 'The :attribute field must be an integer.',
    'ip' => 'The :attribute field must be a valid IP address.',
    'ipv4' => 'The :attribute field must be a valid IPv4 address.',
    'ipv6' => 'The :attribute field must be a valid IPv6 address.',
    'json' => 'The :attribute field must be a valid JSON string.',
    'list' => 'The :attribute field must be a list.',
    'lowercase' => 'The :attribute field must be lowercase.',
    'lt' => [
        'array' => 'The :attribute field must have less than :value items.',
        'file' => 'The :attribute field must be less than :value kilobytes.',
        'numeric' => 'The :attribute field must be less than :value.',
        'string' => 'The :attribute field must be less than :value characters.',
    ],
    'lte' => [
        'array' => 'The :attribute field must not have more than :value items.',
        'file' => 'The :attribute field must be less than or equal to :value kilobytes.',
        'numeric' => 'The :attribute field must be less than or equal to :value.',
        'string' => 'The :attribute field must be less than or equal to :value characters.',
    ],
    'mac_address' => 'The :attribute field must be a valid MAC address.',
    'max' => [
        'array' => 'The :attribute field must not have more than :max items.',
        'file' => 'The :attribute field must not be greater than :max kilobytes.',
        'numeric' => 'The :attribute field must not be greater than :max.',
        'string' => 'The :attribute field must not be greater than :max characters.',
    ],
    'max_digits' => 'The :attribute field must not have more than :max digits.',
    'mimes' => 'The :attribute field must be a file of type: :values.',
    'mimetypes' => 'The :attribute field must be a file of type: :values.',
    'min' => [
        'array' => 'The :attribute field must have at least :min items.',
        'file' => 'The :attribute field must be at least :min kilobytes.',
        'numeric' => 'The :attribute field must be at least :min.',
        'string' => 'The :attribute field must be at least :min characters.',
    ],
    'min_digits' => 'The :attribute field must have at least :min digits.',
    'missing' => 'The :attribute field must be missing.',
    'missing_if' => 'The :attribute field must be missing when :other is :value.',
    'missing_unless' => 'The :attribute field must be missing unless :other is :value.',
    'missing_with' => 'The :attribute field must be missing when :values is present.',
    'missing_with_all' => 'The :attribute field must be missing when :values are present.',
    'multiple_of' => 'The :attribute field must be a multiple of :value.',
    'not_in' => 'The selected :attribute is invalid.',
    'not_regex' => 'The :attribute field format is invalid.',
    'numeric' => 'The :attribute field must be a number.',
    'password' => [
        'letters' => 'The :attribute field must contain at least one letter.',
        'mixed' => 'The :attribute field must contain at least one uppercase and one lowercase letter.',
        'numbers' => 'The :attribute field must contain at least one number.',
        'symbols' => 'The :attribute field must contain at least one symbol.',
        'uncompromised' => 'The given :attribute has appeared in a data leak. Please choose a different :attribute.',
    ],
    'present' => 'The :attribute field must be present.',
    'present_if' => 'The :attribute field must be present when :other is :value.',
    'present_unless' => 'The :attribute field must be present unless :other is :value.',
    'present_with' => 'The :attribute field must be present when :values is present.',
    'present_with_all' => 'The :attribute field must be present when :values are present.',
    'prohibited' => 'The :attribute field is prohibited.',
    'prohibited_if' => 'The :attribute field is prohibited when :other is :value.',
    'prohibited_if_accepted' => 'The :attribute field is prohibited when :other is accepted.',
    'prohibited_if_declined' => 'The :attribute field is prohibited when :other is declined.',
    'prohibited_unless' => 'The :attribute field is prohibited unless :other is in :values.',
    'prohibits' => 'The :attribute field prohibits :other from being present.',
    'regex' => 'The :attribute field format is invalid.',
    'required' => 'The :attribute field is required.',
    'required_array_keys' => 'The :attribute field must contain entries for: :values.',
    'required_if' => 'The :attribute field is required when :other is :value.',
    'required_if_accepted' => 'The :attribute field is required when :other is accepted.',
    'required_if_declined' => 'The :attribute field is required when :other is declined.',
    'required_unless' => 'The :attribute field is required unless :other is in :values.',
    'required_with' => 'The :attribute field is required when :values is present.',
    'required_with_all' => 'The :attribute field is required when :values are present.',
    'required_without' => 'The :attribute field is required when :values is not present.',
    'required_without_all' => 'The :attribute field is required when none of :values are present.',
    'same' => 'The :attribute field must match :other.',
    'size' => [
        'array' => 'The :attribute field must contain :size items.',
        'file' => 'The :attribute field must be :size kilobytes.',
        'numeric' => 'The :attribute field must be :size.',
        'string' => 'The :attribute field must be :size characters.',
    ],
    'starts_with' => 'The :attribute field must start with one of the following: :values.',
    'string' => 'The :attribute field must be a string.',
    'timezone' => 'The :attribute field must be a valid timezone.',
    'unique' => 'The :attribute has already been taken.',
    'uploaded' => 'The :attribute failed to upload.',
    'uppercase' => 'The :attribute field must be uppercase.',
    'url' => 'The :attribute field must be a valid URL.',
    'ulid' => 'The :attribute field must be a valid ULID.',
    'uuid' => 'The :attribute field must be a valid UUID.',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | Here you may specify custom validation messages for attributes using the
    | convention "attribute.rule" to name the lines. This makes it quick to
    | specify a specific custom language line for a given attribute rule.
    |
    */

    'custom' => [
        'pet_id' => [
            'required' => 'Please select an adoptable pet before submitting your application.',
            'exists' => 'This adoption application could not go through because the selected pet is no longer available or has already been adopted. Please refresh the page and choose an available pet.',
        ],
        'shelter_animal_id' => [
            'required' => 'Please select a shelter animal to continue.',
            'exists' => 'The selected animal record could not be processed because it is unavailable or does not match the required status. Please refresh the list and select a valid animal.',
        ],
        'uploadedId' => [
            'required' => 'Your application could not be submitted because a valid ID photo is required. Please upload a clear photo of your government-issued ID in Step 3.',
            'image' => 'The uploaded ID could not be accepted because the file is not an image. Please upload a JPG, PNG, or WEBP photo of your ID.',
            'max' => 'The uploaded ID photo exceeds the 8 MB size limit. Please select a smaller or compressed photo and try again.',
        ],
        'images.*' => [
            'image' => 'One of the attached files could not be uploaded because it is not a supported image format. Please choose JPG, PNG, or WEBP photos and try again.',
            'mimes' => 'One of the attached photos uses an unsupported file format. Please upload JPG, PNG, WEBP, or HEIC images.',
            'max' => 'One of your photos could not be uploaded because it exceeds the 10 MB size limit. Please choose a smaller image or compress the photo and try again.',
        ],
        'proof' => [
            'required' => 'Your payment verification could not go through because the receipt image is missing. Please attach a screenshot or photo of your payment receipt.',
            'image' => 'The payment proof could not be uploaded because it is not a valid image file. Please select a JPG, PNG, or WEBP screenshot.',
            'max' => 'The payment receipt image exceeds the 5 MB limit. Please upload a smaller screenshot or photo.',
        ],
        'proof_image' => [
            'image' => 'The payment proof could not be uploaded because it is not a valid image file. Please select a JPG, PNG, or WEBP screenshot.',
            'max' => 'The payment receipt image exceeds the 5 MB limit. Please upload a smaller screenshot or photo.',
        ],
        'payment_reference' => [
            'required' => 'Please enter the transaction reference number from your payment receipt so our team can verify your donation.',
        ],
        'preferredDate' => [
            'after_or_equal' => 'The preferred interview date cannot be in the past. Please choose today or an upcoming date on the calendar.',
        ],
        'preferred_date' => [
            'after_or_equal' => 'The preferred visit date cannot be in the past. Please choose today or an upcoming date.',
        ],
        'drop_off_date' => [
            'after_or_equal' => 'The scheduled drop-off date cannot be in the past. Please select today or a future date.',
        ],
        'date' => [
            'after_or_equal' => 'The selected date cannot be in the past. Please choose today or an upcoming date.',
        ],
        'familySupportExplanation' => [
            'required_if' => 'Since not everyone in your household supports adopting yet, please explain how you plan to manage the pet’s care and safety.',
        ],
        'foster_capacity' => [
            'required_if' => 'Please enter how many foster pets your home can safely accommodate (between 1 and 20).',
        ],
        'foster_preference' => [
            'required_if' => 'Please select whether you prefer fostering cats, dogs, or both.',
        ],
        'medic_certifications' => [
            'required_if' => 'Medic Volunteer applicants must list their relevant veterinary, medical, or animal first-aid training.',
        ],
        'rejection_reason' => [
            'required' => 'Please provide a clear reason for rejection so the user knows why their submission did not go through and what they can do next.',
            'required_if' => 'Please provide a clear reason for rejection so the applicant knows why their application was declined.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | The following language lines are used to swap our attribute placeholder
    | with something more reader friendly such as "E-Mail Address" instead
    | of "email". This simply helps us make our message more expressive.
    |
    */

    'attributes' => [
        'fullName' => 'full name',
        'full_name' => 'full name',
        'birthDate' => 'birth date',
        'birth_date' => 'birth date',
        'socialMedia' => 'social media link',
        'adoptionSource' => 'how you heard about us',
        'adoptedBefore' => 'previous adoption experience',
        'emergencyName' => 'emergency contact name',
        'emergencyRelationship' => 'emergency contact relationship',
        'emergencyPhone' => 'emergency contact phone number',
        'emergencyEmail' => 'emergency contact email address',
        'adoptionPreference' => 'adoption preference',
        'residenceType' => 'residence type',
        'isRenting' => 'renting status',
        'movingPlan' => 'future moving plan',
        'livesWith' => 'household members',
        'hasAllergies' => 'household allergy status',
        'dailyCareHandler' => 'daily care person',
        'expensesHandler' => 'pet expenses handler',
        'emergencyHandler' => 'emergency care handler',
        'hoursAlone' => 'hours pet will be left alone',
        'introductionPlan' => 'pet introduction plan',
        'familySupport' => 'family support status',
        'familySupportExplanation' => 'family support explanation',
        'currentPets' => 'current pets status',
        'pastPets' => 'past pets status',
        'uploadedId' => 'valid government ID photo',
        'frontHouse' => 'front of house photo',
        'streetView' => 'street view photo',
        'livingRoom' => 'living room photo',
        'diningArea' => 'dining area photo',
        'preferredDate' => 'preferred interview date',
        'preferredTime' => 'preferred interview time',
        'canVisitShelter' => 'shelter visit availability',
        'animalType' => 'animal type',
        'animal_type' => 'animal type',
        'petType' => 'pet type',
        'petName' => 'pet name',
        'animal_name' => 'animal name',
        'ageCategory' => 'age category',
        'age_category' => 'age category',
        'situationType' => 'emergency situation type',
        'situation_type' => 'emergency situation type',
        'lastSeenLocation' => 'last seen location',
        'lastSeenDate' => 'date last seen',
        'distinguishingFeatures' => 'distinguishing features',
        'medicalConditions' => 'medical conditions',
        'contactName' => 'contact name',
        'contact_name' => 'contact name',
        'contactPhone' => 'contact phone number',
        'contact_phone' => 'contact phone number',
        'contact_number' => 'contact phone number',
        'contactEmail' => 'contact email address',
        'contact_email' => 'contact email address',
        'donor_name' => 'donor name',
        'donor_email' => 'donor email address',
        'donor_mobile' => 'donor mobile number',
        'drop_off_date' => 'drop-off date',
        'payment_reference' => 'payment reference number',
        'payment_method' => 'payment method',
        'payment_channel' => 'payment channel',
        'proof' => 'payment receipt image',
        'proof_image' => 'payment receipt image',
        'preferred_date' => 'preferred date',
        'preferred_time_slot' => 'preferred time slot',
        'number_of_visitors' => 'number of visitors',
        'shelter_animal_id' => 'selected pet',
        'pet_id' => 'selected pet',
        'foster_parent_id' => 'selected foster parent',
        'destination_foster_parent_id' => 'destination foster parent',
        'foster_capacity' => 'foster capacity',
        'foster_preference' => 'foster pet preference',
        'medic_certifications' => 'medical certifications',
        'transport_has_license' => 'driver license declaration',
        'otp' => 'verification code',
    ],

];
