<?php

namespace Database\Seeders;

use App\Models\CommunityHonor;
use App\Models\Partner;
use App\Models\ResourceFile;
use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class PartnerAndResourceSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Partners
        $partners = [
            [
                'name' => 'Dr. E Veterinary Clinic',
                'slug' => 'dr-e-veterinary-clinic',
                'category' => 'veterinary',
                'badge_title' => 'FREQUENTLY CONTACTED BY ISF',
                'badges' => ['Emergency Response', 'Frequently Contacted by ISF'],
                'short_description' => 'Frequently contacted by ISF for veterinary and emergency animal care.',
                'description' => 'Primary veterinary clinic in Iligan City located along Dao Hinaplanon Highway (in front of Gerona Enterprises). Provides emergency trauma response, medical consultations, vaccinations, minor and major surgeries, and post-treatment confinement for rescued stray cats and dogs.',
                'address' => 'Purok 3 Barangay Dao, Hinaplanon, Highway, Iligan City, 9200 Lanao del Norte',
                'city' => 'Tambo, Iligan City',
                'latitude' => 8.2485580,
                'longitude' => 124.2608434,
                'phone' => '+63 956 381 9018',
                'email' => 'dre.vetclinic@gmail.com',
                'operating_hours' => 'Mon - Sat: 8:00 AM – 7:00 PM | Sun: 9:00 AM – 3:00 PM',
                'services' => ['Emergency Response', 'Consultations', 'Vaccinations', 'Minor/Major Surgery', 'Confinement'],
                'image_url' => '/images/partners/dr-e.jpg',
                'is_emergency' => true,
                'is_featured' => true,
                'is_active' => true,
                'display_order' => 1,
            ],
            [
                'name' => 'Petmate Veterinary Clinic',
                'slug' => 'petmate-veterinary-clinic',
                'category' => 'veterinary',
                'badge_title' => 'TRUSTED VETERINARY RESOURCE',
                'badges' => ['Trusted Veterinary Resource', 'Emergency Option'],
                'short_description' => 'Veterinary resource contacted by ISF when additional veterinary assistance is needed.',
                'description' => 'Trusted companion animal clinic on Camague Highway, Tominobo (near Shell Station) offering wellness check-ups, deworming, core vaccinations, spay/neuter support, diagnostic lab work, and after-clinic emergency care (with standard after-hours fee).',
                'address' => '666J+R6J, Iligan City, Lanao del Norte',
                'city' => 'Palao / Camague, Iligan City',
                'latitude' => 8.2123657,
                'longitude' => 124.2304882,
                'phone' => '+63 935 380 1820',
                'email' => 'petmate.iligan@gmail.com',
                'operating_hours' => 'Mon - Sat: 8:00 AM – 6:00 PM | Sun: 8:00 AM – 3:00 PM (After-hours emergency available)',
                'services' => ['Routine Check-ups', 'Deworming & Vaccines', 'Diagnostics', 'Spay & Neuter', 'After-Hours Emergency'],
                'image_url' => '/images/partners/petmate.jpg',
                'is_emergency' => true,
                'is_featured' => false,
                'is_active' => true,
                'display_order' => 2,
            ],
            [
                'name' => 'Furpet\'sake Veterinary Clinic',
                'slug' => 'furpet-furmate-clinic',
                'category' => 'veterinary',
                'badge_title' => 'EMERGENCY OPTION',
                'badges' => ['Emergency Option', 'Veterinary Resource'],
                'short_description' => 'Veterinary resource mentioned by ISF for emergency and routine animal care.',
                'description' => 'Full-service veterinary clinic and pet supply center on V. Sheker Street in Barangay Bagong Silang, providing wellness exams, emergency triage, prescribed medications, parasite control, and grooming support for rescued cats and dogs in Iligan City.',
                'address' => '67Q2+W8P Brgy, Vicente Sheker St, Bagong Silang, Iligan City, 9200 Lanao del Norte',
                'city' => 'Bagong Silang, Iligan City',
                'latitude' => 8.2399905,
                'longitude' => 124.2507731,
                'phone' => '+63 917 105 0446',
                'email' => 'furpetsake.iligan@gmail.com',
                'operating_hours' => 'Mon - Sat: 9:00 AM – 6:00 PM | Sun: Closed',
                'services' => ['Wellness Exams', 'Emergency Triage', 'Medications', 'Parasite Control', 'Grooming'],
                'image_url' => '/images/partners/furpet.jpg',
                'is_emergency' => true,
                'is_featured' => false,
                'is_active' => true,
                'display_order' => 3,
            ],
            [
                'name' => 'Greenwich',
                'slug' => 'greenwich-partner',
                'category' => 'food_supply',
                'badge_title' => 'REGULAR FOOD SUPPORT',
                'badges' => ['Regular Food Support'],
                'short_description' => 'Provides regular prepared food support for animals under ISF care.',
                'description' => 'Commercial food partner providing scheduled feeding provisions and assistance for community animal feeding runs.',
                'address' => 'Iligan City Commercial Center',
                'city' => 'Iligan City',
                'operating_hours' => 'Daily: 10:00 AM – 8:00 PM',
                'image_url' => '/images/partners/greenwich.png',
                'logo_url' => 'GW',
                'is_emergency' => false,
                'is_featured' => true,
                'provides_daily_food' => true,
                'daily_food_notes' => 'Daily prepared food for shelter animals (1-day shelf life — must be fetched same day).',
                'is_active' => true,
                'display_order' => 5,
            ],
            [
                'name' => 'House of Rice',
                'slug' => 'house-of-rice-partner',
                'category' => 'food_supply',
                'badge_title' => 'REGULAR SUPPORTER',
                'badges' => ['Regular Supporter', 'Weekly Sustenance'],
                'short_description' => 'Weekly rice and food resource support for ISF shelter animals.',
                'description' => 'Dedicated grains and basic sustenance donor supplying rice bags for daily community feeding rounds.',
                'address' => 'Palao Public Market District',
                'city' => 'Iligan City',
                'operating_hours' => 'Weekly Schedule',
                'image_url' => '/images/partners/house-of-rice.jpg',
                'logo_url' => 'HR',
                'is_emergency' => false,
                'is_featured' => true,
                'is_active' => true,
                'display_order' => 6,
            ],
            [
                'name' => "Momoy's Pet Supplies",
                'slug' => 'momoys-pet-supply',
                'category' => 'food_supply',
                'badge_title' => 'SUPPLY RESOURCE',
                'badges' => ['Supply Resource', 'Essential Gear'],
                'short_description' => 'Pet supply resource identified by ISF for sourcing food and supplies.',
                'description' => 'Local animal supply partner offering discounted kibble, leashes, feeding bowls, and medications for rescued animals.',
                'address' => 'Cabili Avenue, Poblacion',
                'city' => 'Iligan City',
                'phone' => '+63 922 415 8990',
                'operating_hours' => 'Mon - Sat: 8:00 AM – 6:00 PM',
                'image_url' => '/images/partners/momoys.jpg',
                'logo_url' => 'MP',
                'is_emergency' => false,
                'is_featured' => false,
                'is_active' => true,
                'display_order' => 7,
            ],
            [
                'name' => 'Sumalinog Accounting & Outsourcing Services',
                'slug' => 'sumalinog-accounting-outsourcing',
                'category' => 'audit',
                'badge_title' => 'Mia Renee Sumalinog, CPA',
                'badges' => ['Independent Financial Auditor', 'NGO Transparency Assurance', 'PRC-BOA Accredited'],
                'short_description' => 'Accredited independent Certified Public Accounting firm providing annual compliance audits, donation verification, and financial transparency reviews for ISF.',
                'description' => 'Sumalinog Accounting & Outsourcing Services is an accredited Certified Public Accounting firm based in Northern Mindanao providing annual financial reviews, donation fund verification, and statutory transparency certification for Iligan Stray Feeders.',
                'address' => 'Suite 302, Diocesan Pastoral Center, Lluch Street',
                'city' => 'Poblacion, Iligan City',
                'phone' => '+63 63 222 1098',
                'email' => 'audit.transparency@isf-partners.ph',
                'website_url' => 'https://iliganstrayfeeders.org/transparency',
                'operating_hours' => 'Mon - Fri: 8:30 AM – 5:30 PM',
                'services' => ['Annual Financial Audit', 'Donation Fund Verification', 'NGO Statutory Compliance', 'Disbursement Transparency'],
                'image_url' => '/images/partners/audit-partner.jpg',
                'logo_url' => 'VA',
                'is_emergency' => false,
                'is_featured' => true,
                'is_active' => true,
                'display_order' => 8,
            ],
            [
                'name' => 'Iligan City Veterinary Services Office',
                'slug' => 'iligan-city-vet-services',
                'category' => 'collaborator',
                'badge_title' => 'LGU ADVOCACY COLLABORATOR',
                'badges' => ['LGU Partner', 'Rabies Prevention', 'Spay & Neuter Outreach'],
                'short_description' => 'Local government partner cooperating on city-wide rabies vaccination and stray animal welfare initiatives.',
                'description' => 'Public sector partner collaborating with Iligan Stray Feeders on humane community animal management, mass vaccination campaigns, and public awareness programs.',
                'address' => 'City Agriculture Complex, Palao',
                'city' => 'Palao, Iligan City',
                'phone' => '+63 63 221 4455',
                'email' => 'vet.services@iligancity.gov.ph',
                'website_url' => 'https://iligan.gov.ph',
                'operating_hours' => 'Mon - Fri: 8:00 AM – 5:00 PM',
                'services' => ['Anti-Rabies Drive Coordination', 'Community Education', 'Humane Impound Reform Advocacy'],
                'image_url' => '/images/partners/dr-e.jpg',
                'logo_url' => 'IC',
                'is_emergency' => false,
                'is_featured' => false,
                'is_active' => true,
                'display_order' => 9,
            ],
            [
                'name' => 'Hope for Paws Mindanao Initiative',
                'slug' => 'hope-for-paws-mindanao',
                'category' => 'sponsor',
                'badge_title' => 'MONTHLY SUSTAINING SPONSOR',
                'badges' => ['Monthly Feeding Sponsor', 'Emergency Medical Fund'],
                'short_description' => 'Philanthropic initiative sponsoring critical emergency surgeries and monthly kibble supplies for ISF shelter rescues.',
                'description' => 'Regional welfare benefactor providing monthly sustenance contributions and dedicated medical funds for complex rescue treatments and shelter rehabilitation.',
                'address' => 'Palao District',
                'city' => 'Iligan City',
                'phone' => '+63 917 554 8899',
                'email' => 'support@hopeforpawsmindanao.org',
                'website_url' => 'https://hopeforpawsmindanao.org',
                'operating_hours' => 'Mon - Sat: 9:00 AM – 5:00 PM',
                'services' => ['Kibble Allocation Sponsorship', 'Critical Medical Grant', 'Foster Starter Kits'],
                'image_url' => '/images/partners/furpet.jpg',
                'logo_url' => 'HP',
                'is_emergency' => false,
                'is_featured' => true,
                'is_active' => true,
                'display_order' => 10,
            ],
        ];

        foreach ($partners as $item) {
            Partner::updateOrCreate(['slug' => $item['slug']], $item);
        }

        // 2. Resource Files
        $resources = [
            [
                'title' => 'Pet Boarding - Cats',
                'slug' => 'pet-boarding-cats',
                'category' => 'boarding',
                'badge' => 'COMMUNITY DIRECTORY',
                'description' => 'ISF has contacts for cat boarding services provided by trusted foster caregivers and private pet care providers in Iligan.',
                'content' => <<<'TEXT'
## Service & Referral Snapshot
Service Area: Iligan City (Poblacion, Tibanga, Palao, Tambo & nearby barangays)
Boarding Format: Home-based feline foster rooms & vetted private cat boarding spaces
Estimated Community Rate: PHP 350 - PHP 600 per day (confirm inclusions directly with caregiver)
Coordination Desk: Iligan Stray Feeders Community Referral Desk

Directory of approved foster parents and home-based feline boarding spaces equipped for safe, quiet, short-term stays. Cats are sensitive to sudden environmental changes, so ISF prioritizes low-stress, escape-proof indoor rooms separated from dogs.

## Pre-Boarding Health Requirements
- Updated 4-in-1 (FVRCP) vaccine and anti-rabies record booklet must be presented before drop-off.
- Recent deworming and flea/tick spot-on preventive applied at least 7 days prior to boarding.
- Cats must be free from active upper respiratory symptoms (sneezing, eye discharge, or fever) to protect other resident pets.
- Spayed or neutered status should be declared in advance so caregivers can arrange isolated housing if needed.

## What to Pack for Your Cat
- Enough of your cat's regular dry/wet food for the full stay plus 2 extra days to prevent digestive upset.
- A familiar blanket, worn t-shirt with your scent, or favorite small toy to reduce separation stress.
- Preferred litter brand or transition scoop if your cat refuses unfamiliar litter substrates.
- Secure hard-shell carrier labeled with your name, emergency contact number, and preferred Iligan vet clinic.
- Written feeding schedule and clear dosage instructions for any maintenance medications or vitamins.

## Questions to Ask Before Confirming
- How many cats share the room, and are separate multi-tier enclosures or private rooms available?
- Are daily photo or video updates sent to owners, including litter box and appetite logs?
- Which Iligan City veterinary clinic (such as Dr. E, Petmate, or Furpet'sake) is contacted in case of emergency?
TEXT,
                'image_url' => '/images/resources/cat-boarding.jpg',
                'file_name' => 'Cat-Boarding-Directory-Iligan.pdf',
                'file_size' => '1.2 MB',
                'file_type' => 'pdf',
                'download_count' => 48,
                'is_featured' => true,
                'is_active' => true,
                'display_order' => 1,
            ],
            [
                'title' => 'Pet Boarding - Dogs',
                'slug' => 'pet-boarding-dogs',
                'category' => 'boarding',
                'badge' => 'INFORMATIONAL RESOURCE',
                'description' => 'ISF has contacts for dog boarding resources. Contact ISF directly or our partner clinics for referrals.',
                'content' => <<<'TEXT'
## Service & Referral Snapshot
Service Area: Iligan City & nearby Lanao del Norte communities
Accommodation Types: Clinic-supervised kennel confinement & home-based canine boarding
Typical Rate Range: PHP 400 - PHP 800 per day depending on dog size and care level
Referral Contact: ISF Volunteer Desk or Partner Veterinary Clinics

List of vetted canine accommodations and preparation guidelines offering safe, secure, and stress-free boarding while pet parents travel or handle emergencies.

## Mandatory Canine Health & Vaccination Checklist
- Up-to-date 5-in-1 or 6-in-1 (DHPPiL) vaccination and annual anti-rabies certificate.
- Active tick, flea, and heartworm prevention (especially important in tropical outdoor play yards).
- Kennel cough (Bordetella) vaccination strongly recommended when boarding alongside other dogs.
- Full disclosure of prior medical history, seizures, heat cycles, or food allergies.

## Facility Safety & Inspection Checklist
- Double-gated entryways and secure perimeter fencing with zero gaps for escape-prone rescues.
- Clean, shaded, well-ventilated sleeping areas with elevated bedding and constant fresh water access.
- Separate rest zones for shy, senior, or newly adopted Aspins who may feel overwhelmed by large groups.
- Scheduled potty breaks, supervised enrichment, and documented meal logging twice daily.

## Preparing Your Dog for Drop-Off
- Pack measured portions of regular kibble and treats to avoid sudden diet changes.
- Provide a well-fitted harness or collar with an ID tag listing your mobile number and an alternate local contact.
- Share behavioral notes honestly (food guarding, thunderstorm anxiety, reactivity to cats or strangers).
- Schedule a short 1-hour meet-and-greet visit beforehand whenever possible to help your dog build trust.
TEXT,
                'image_url' => '/images/resources/dog-boarding.jpg',
                'file_name' => 'Dog-Boarding-Referrals-Iligan.pdf',
                'file_size' => '1.8 MB',
                'file_type' => 'pdf',
                'download_count' => 62,
                'is_featured' => true,
                'is_active' => true,
                'display_order' => 2,
            ],
            [
                'title' => 'Pet Insurance',
                'slug' => 'pet-insurance',
                'category' => 'insurance',
                'badge' => 'COMMUNITY RESOURCE',
                'description' => 'Pet insurance after adoption is the adopter\'s responsibility. ISF has information on pet insurance options available in the Philippines.',
                'content' => <<<'TEXT'
## Adopter Responsibility & Coverage Overview
Responsibility: Managed and funded directly by the adopter after official adoption turnover
Market Scope: Philippine non-life insurance providers offering companion dog & cat policies
Typical Annual Premium: PHP 1,500 - PHP 7,500 per year depending on tier & vet reimbursement cap
ISF Advisory Role: Educational comparison only (ISF does not sell or broker policies)

Comparison of veterinary health insurance options, accidental injury reimbursement, and emergency financial planning for dog and cat adopters in the Philippines.

## Notable Philippine Pet Insurance Providers to Research
- Malayan Insurance (Pet Care Insurance): Covers accidental injury, medical reimbursement, owner liability, and burial assistance for eligible dogs and cats.
- Standard Insurance (Pet Protect): Offers annual medical reimbursement tiers, personal accident coverage for owners, and third-party liability protection.
- BDO Insure / Partner Micro-Plans: Accessible annual plans tailored for household pets with straightforward digital claims submission.
- Clinic Wellness Packages & Emergency Pet Funds: For senior rescues or mixed-breed pets outside insurer age limits, setting aside PHP 300 - PHP 500 monthly in a dedicated vet fund provides immediate liquidity.

## Common Eligibility & Documentation Requirements
- Pet age generally between 6 months and 8 years at initial enrollment (renewal rules vary by insurer).
- Updated veterinary vaccination booklet signed by a PRC-licensed veterinarian.
- Clear identification photos and, for higher coverage tiers, microchip registration number.
- Standard 15 to 30-day waiting periods apply; pre-existing conditions are typically excluded.

## How to File Claims Smoothly
- Always request itemized official receipts (OR) and a signed Veterinary Medical Abstract after every clinic visit.
- Take clear photos of diagnostic lab results, prescriptions, and discharge summaries before leaving the clinic.
- Notify your insurer within their required window (often 7 to 15 days from incident date).
TEXT,
                'image_url' => '/images/resources/pet-insurance.jpg',
                'file_name' => 'Pet-Insurance-Guide-Philippines.pdf',
                'file_size' => '940 KB',
                'file_type' => 'pdf',
                'download_count' => 31,
                'is_featured' => true,
                'is_active' => true,
                'display_order' => 3,
            ],
            [
                'title' => 'Pet Training',
                'slug' => 'pet-training',
                'category' => 'training',
                'badge' => 'INFORMATIONAL RESOURCE',
                'description' => 'Pet training and behavioral guidance have been compiled by ISF for adopters. Check our free resource guide.',
                'content' => <<<'TEXT'
## Positive Reinforcement & Rescue Decompression
Training Philosophy: Force-free, reward-based positive reinforcement (never physical punishment)
Recommended Session Length: 5 to 10 minutes, twice daily, ending on a successful repetition
Best Rewards: Small soft treats, verbal praise ("Yes!"), gentle chest scratches, or play
Target Audience: Newly adopted street rescues (Aspins & Puspins) and foster pets

Positive reinforcement techniques, basic obedience foundations, leash manners, and anxiety reduction designed specifically for rescued cats and dogs adjusting to family homes.

## The 3-3-3 Rule for Newly Adopted Rescues
- First 3 Days: Your pet may feel overwhelmed, hide, sleep excessively, or refuse meals. Keep routines calm, quiet, and predictable with limited visitors.
- First 3 Weeks: Your rescue starts learning house schedules, recognizing family voices, and testing boundaries. Begin gentle name recognition and basic cues.
- First 3 Months: Deep trust forms and your pet's true playful personality emerges. Continue consistent boundaries, socialization, and enrichment.

## Core Everyday Skills to Practice First
- Name & Eye Contact: Say your pet's name once cheerfully; reward immediately the moment they look at you.
- Potty & Litter Routine: Take dogs outdoors right after waking, eating, and naps; keep cat litter boxes scoop-cleaned daily in quiet, low-traffic corners.
- Loose-Leash Walking: Use a Y-front harness instead of choke chains; pause walking when your dog pulls and reward when slack returns.
- Safe Crate & Quiet Space Training: Feed meals near an open carrier or bed so it becomes a comforting sanctuary rather than a punishment spot.

## When to Seek Professional Behavioral or Vet Support
- Sudden aggression, house-soiling, or intense hiding should first be evaluated by a veterinarian to rule out hidden pain or infection.
- Contact ISF post-adoption support if your newly adopted pet struggles with separation panic or multi-pet introductions.
TEXT,
                'image_url' => '/images/resources/pet-training.jpg',
                'file_name' => 'Positive-Dog-Training-Handbook.pdf',
                'file_size' => '3.1 MB',
                'file_type' => 'pdf',
                'download_count' => 115,
                'is_featured' => true,
                'is_active' => true,
                'display_order' => 4,
            ],
            [
                'title' => 'Pet Memorial & Remembrance',
                'slug' => 'pet-memorial-remembrance',
                'category' => 'memorial',
                'badge' => 'COMMUNITY RESOURCE',
                'description' => 'ISF has remembrance resources for pet memorial services and support to help grieving pet parents honor their lost companions.',
                'content' => <<<'TEXT'
## Compassionate Aftercare & Grief Support
Coverage Area: Iligan City & Northern Mindanao regional remembrance providers
Support Focus: Dignified aftercare planning, keepsakes, and emotional healing for pet families
ISF Tribute Option: Honor a beloved companion by sponsoring a stray feeding round in their memory

Grief resources, humane aftercare guidance, memorial paw keepsakes, and meaningful ways to honor departed companion animals in Iligan City.

## Immediate Practical Steps After a Pet Passes
- If your pet passed at home, gently wrap them in a clean, soft blanket or towel and place them in a cool, quiet room while you make arrangements.
- Contact your attending veterinary clinic (Dr. E, Petmate, or Furpet'sake) for compassionate aftercare referrals or temporary cold storage if arranging cremation.
- If burying on private property where permitted, choose a shaded site away from water lines and dig at least 3 to 4 feet deep to protect the resting place.
- For communal or private aquamation/cremation options in Northern Mindanao, confirm urn return timelines and certificate documentation directly with the memorial provider.

## Meaningful Ways to Honor Their Memory
- Paw Print & Fur Keepsake: Gently press your pet's paw onto air-dry clay or non-toxic ink pad, or preserve a small lock of fur in a glass vial.
- Memory Corner & Photo Tribute: Frame a favorite candid photo alongside their collar tag and a living indoor plant.
- Feed Furr A Cause Tribute: Dedicate a meal sponsorship or rescue donation through PAWLSE in your pet's name so their love continues nourishing Iligan strays.

## Navigating Pet Loss Grief
- Allow yourself and children time to grieve openly; losing a companion animal is a genuine family bereavement.
- Maintain steady routines for surviving household pets, as cats and dogs can also notice a companion's absence.
TEXT,
                'image_url' => '/images/resources/pet-memorial.jpg',
                'file_name' => 'Pet-Memorial-Keepsake-Guide.pdf',
                'file_size' => '850 KB',
                'file_type' => 'pdf',
                'download_count' => 19,
                'is_featured' => true,
                'is_active' => true,
                'display_order' => 5,
            ],
            [
                'title' => 'Pet Portraits',
                'slug' => 'pet-portraits',
                'category' => 'portrait',
                'badge' => 'COMMUNITY RESOURCE',
                'description' => 'Local artists in Iligan City create pet portraits with a portion of proceeds donated to ISF.',
                'content' => <<<'TEXT'
## Art That Feeds Iligan's Strays
Community Impact: 20% of participating commission proceeds support ISF stray feeding & rescue funds
Available Mediums: Digital Pet Illustration, Traditional Watercolor, Graphite Sketch & Minimalist Line Art
Typical Turnaround: 5 to 14 business days depending on artwork detail and framing
Coordination: Direct artist booking or inquiry through ISF Community Channels

Directory guidelines for commissioning custom pet portraits from talented local Iligan City artists whose work directly contributes back to community feeding runs and shelter medical funds.

## How to Submit the Best Reference Photos
- Shoot in natural daylight near a window or outdoors in light shade so fur colors and eye reflections stay accurate.
- Take photos at your pet's eye level rather than straight down from above to capture their true expression.
- Share 2 to 3 clear, uncropped photos (front face plus a personality shot showing favorite ears, markings, or collar).
- Mention any special details you want highlighted (a favorite bandana, rainbow bridge halo, or pet name lettering).

## Commissioning & Delivery Guidelines
- Confirm artwork dimensions (A5, A4, high-resolution digital print file), background style, and total fee before paying a deposit.
- Ask if a quick pencil or digital rough sketch preview is included for minor revisions before final coloring.
- Request verification of the ISF charity share if you are booking through an official ISF fundraising art drive.
- Local pickup in Iligan City or nationwide courier shipping can be arranged directly with the artist.
TEXT,
                'image_url' => '/images/resources/pet-portraits.jpg',
                'file_name' => 'Local-Pet-Artists-Directory.pdf',
                'file_size' => '1.5 MB',
                'file_type' => 'pdf',
                'download_count' => 40,
                'is_featured' => true,
                'is_active' => true,
                'display_order' => 6,
            ],
            [
                'title' => 'ISF Emergency Animal First Aid & Triage',
                'slug' => 'isf-emergency-animal-first-aid-triage',
                'category' => 'emergency_protocol',
                'badge' => 'ISF OFFICIAL PROTOCOL',
                'description' => 'Emergency care protocol for field volunteers and community members encountering injured animals.',
                'content' => <<<'TEXT'
## Official ISF Field Triage Protocol
Protocol Authority: Iligan Stray Feeders Rescue Operations & Veterinarian on Record
Primary Triage Goal: Stabilize airway, control bleeding, prevent shock, and transport rapidly
Immediate Reporting: Submit an SOS Report on PAWLSE with GPS pin and clear injury photo
Primary Emergency Clinic: Dr. E Veterinary Clinic (Tambo, Iligan City) — +63 956 381 9018

Step-by-step field response instructions for volunteers and concerned citizens encountering vehicular trauma, severe wounds, heatstroke, or suspected poisoning in Iligan City.

## Step 1: Scene Safety & Calm Restraint
- Park safely with hazard lights on and move bystanders back to keep frightened animals from bolting into traffic.
- Approach slowly from the side in a low posture; speak softly and avoid direct looming eye contact.
- Even gentle animals may bite when in severe pain: wrap cats snugly in a thick towel ("burrito wrap") and use a soft cloth loop muzzle for alert dogs (NEVER muzzle a vomiting, panting, or short-snouted dog).

## Step 2: Critical Red Flags Requiring Immediate Transport
- Uncontrolled bleeding, deep lacerations, exposed bone fractures, or suspected internal trauma after a road collision.
- Pale/white or blue-tinted gums, labored open-mouth breathing in cats, or unresponsiveness.
- Continuous seizures, foaming at the mouth, severe tremors, or suspected toxic ingestion (rat poison, chocolate, household bleach, human painkillers).
- Heatstroke signs: frantic heavy panting, bright red gums, stumbling, or collapse under midday sun.

## Step 3: Safe Stabilization Before Reaching the Clinic
- Active Bleeding: Apply firm, direct pressure with sterile gauze or clean cloth for at least 3 to 5 minutes; do not remove soaked pads—layer fresh cloth on top.
- Suspected Spinal/Limb Trauma: Slide the animal gently onto a rigid cardboard sheet, wooden board, or folded blanket stretched taut as a makeshift stretcher.
- Heatstroke: Move immediately to shade/air-conditioning, drape cool (NOT ice-cold) wet towels over paws, belly, and neck, and fan continuously during transport.
- Poisoning: Do NOT induce vomiting unless instructed by a licensed veterinarian; bring packaging or take a photo of the suspected toxin.

## Step 4: Rapid Clinic Referral & Handoff
- Call ahead to Dr. E (+63 956 381 9018), Petmate (+63 935 380 1820), or Furpet'sake (+63 917 105 0446) so the clinic can prepare emergency triage supplies before arrival.
- Log the rescue time, exact Iligan barangay location, and treatment updates in the PAWLSE Rescue Portal for medical continuity.
TEXT,
                'image_url' => '/images/partners/dr-e.jpg',
                'file_name' => 'ISF-Emergency-Field-Protocol.pdf',
                'file_size' => '2.4 MB',
                'file_type' => 'pdf',
                'download_count' => 210,
                'is_featured' => true,
                'is_active' => true,
                'display_order' => 7,
            ],
        ];

        foreach ($resources as $res) {
            ResourceFile::updateOrCreate(['slug' => $res['slug']], $res);
        }

        // 3. Community Honors
        $honors = [
            [
                'name' => 'Miguel Burton',
                'category' => 'donor',
                'tier' => 'platinum',
                'role_title' => 'Feeding Supporter',
                'description' => 'Has provided approximately one year of food support for cats and dogs, including sponsorship of a March feeding activity.',
                'badges' => ['Feeding Supporter', 'Recurring Supporter'],
                'initials' => 'MB',
                'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
                'is_featured' => true,
                'is_public' => true,
                'display_order' => 1,
            ],
            [
                'name' => 'Councilor Derreck Siao',
                'category' => 'donor',
                'tier' => 'platinum',
                'role_title' => 'Recurring Supporter',
                'description' => 'Thank you for your continued support for animals under ISF care.',
                'badges' => ['Recurring Supporter'],
                'initials' => 'CD',
                'avatar_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
                'is_featured' => true,
                'is_public' => true,
                'display_order' => 2,
            ],
            [
                'name' => 'Leilani Fernandez',
                'category' => 'community_supporter',
                'tier' => null,
                'role_title' => 'ISF Supporter',
                'description' => "Thank you for being part of ISF's journey.",
                'badges' => ['Community Supporter'],
                'initials' => 'LF',
                'avatar_url' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
                'is_featured' => false,
                'is_public' => true,
                'display_order' => 3,
            ],
            [
                'name' => 'Hadassah Javest',
                'category' => 'community_supporter',
                'tier' => null,
                'role_title' => 'ISF Supporter',
                'description' => "Thank you for being part of ISF's journey.",
                'badges' => ['Community Supporter'],
                'initials' => 'HJ',
                'avatar_url' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
                'is_featured' => false,
                'is_public' => true,
                'display_order' => 4,
            ],
            [
                'name' => 'Tiffany Jane Aroco',
                'category' => 'community_supporter',
                'tier' => null,
                'role_title' => 'ISF Supporter',
                'description' => "Thank you for being part of ISF's journey.",
                'badges' => ['Community Supporter'],
                'initials' => 'TJ',
                'avatar_url' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
                'is_featured' => false,
                'is_public' => true,
                'display_order' => 5,
            ],
            [
                'name' => 'Maria Santos',
                'category' => 'volunteer',
                'tier' => 'core_member',
                'role_title' => 'Core Volunteer',
                'description' => 'Led over 30 street rescue operations and rehabilitation cases in Iligan.',
                'badges' => ['Core Volunteer', 'Rescue Lead', 'Kind Heart'],
                'initials' => 'MS',
                'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
                'is_featured' => false,
                'is_public' => true,
                'display_order' => 6,
            ],
            [
                'name' => 'Kenneth Alonto',
                'category' => 'volunteer',
                'tier' => 'core_member',
                'role_title' => 'Volunteer Foster',
                'description' => 'Dedicated foster parent providing temporary sanctuary and loving care for recuperating rescues.',
                'badges' => ['Kind Heart', 'In-Kind Supporter'],
                'initials' => 'KA',
                'avatar_url' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
                'is_featured' => false,
                'is_public' => true,
                'display_order' => 7,
            ],
            [
                'name' => 'Dr. Ronald Epe',
                'category' => 'sponsor',
                'tier' => 'gold',
                'role_title' => 'Veterinary Partner',
                'description' => 'Providing life-saving veterinary treatment, emergency operations, and vaccinations for rescued strays.',
                'badges' => ['Veterinary Partner', 'Long-Time Supporter'],
                'initials' => 'RE',
                'avatar_url' => 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
                'is_featured' => false,
                'is_public' => true,
                'display_order' => 8,
            ],
        ];

        foreach ($honors as $hon) {
            CommunityHonor::updateOrCreate(['name' => $hon['name']], $hon);
        }

        // Configure system settings for honor volunteer metrics
        SystemSetting::setValue('community_honor_stats', [
            'core_members_count' => 15,
            'active_volunteers_count' => 42,
            'on_call_volunteers_count' => 28,
            'meals_served_display' => '12k+',
            'pets_rescued_display' => '450+',
            'adoptions_display' => '85+',
            'active_zones_display' => '15',
        ]);
    }
}
