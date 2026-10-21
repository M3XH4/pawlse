export interface PetBreed {
  id: string;
  name: string;
  species: 'Dog' | 'Cat';
  aliases: string[];
  origin?: string;
  size: 'Toy' | 'Small' | 'Medium' | 'Large' | 'Giant';
  coat: 'Short' | 'Medium' | 'Long' | 'Hairless' | 'Double' | 'Curly' | 'Wire';
  ears: 'Erect' | 'Drop / Floppy' | 'Semi-erect' | 'Folded';
  build: string;
  colors: string[];
  characteristics: string[];
  identification_tips: string;
  confused_with: string[];
  image_url: string;
}

export const PET_BREEDS_CATALOG: PetBreed[] = [
  // 🐶 DOGS
  {
    id: 'aspin',
    name: 'Aspin (Asong Pinoy)',
    species: 'Dog',
    aliases: ['Asong Pinoy', 'Philippine Native Dog', 'Askals', 'Indigenous Dog'],
    origin: 'Philippines',
    size: 'Medium',
    coat: 'Short',
    ears: 'Semi-erect',
    build: 'Athletic, lean, medium-boned with natural stamina',
    colors: ['Brown / Tan', 'Black', 'Brindle', 'White', 'Piebald / Bi-color'],
    characteristics: ['Pointed or semi-pricked ears', 'Wedge-shaped head', 'Curved sickle tail', 'Short sleek weather-resistant coat'],
    identification_tips: 'Common native Philippine canine. Often confused with Belgian Malinois or mixed hounds, but possesses a leaner muzzle, sickle tail, and diverse coat coloration without heavy masking.',
    confused_with: ['Belgian Malinois', 'Chihuahua Mix', 'German Shepherd Mix'],
    image_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'labrador-retriever',
    name: 'Labrador Retriever',
    species: 'Dog',
    aliases: ['Labrador', 'Lab'],
    origin: 'Canada / United Kingdom',
    size: 'Large',
    coat: 'Double',
    ears: 'Drop / Floppy',
    build: 'Sturdy, broad head, deep chest, powerful otter tail',
    colors: ['Yellow', 'Black', 'Chocolate'],
    characteristics: ['Thick water-resistant double coat', 'Broad skull with friendly eyes', 'Otter tail thick at base', 'Drop ears hanging close to head'],
    identification_tips: 'Solid coat color without markings (yellow, black, or deep chocolate). Distinct broad head and thick tail distinguish it from Golden Retrievers and hounds.',
    confused_with: ['Golden Retriever', 'Beagle Mix', 'Chesapeake Bay Retriever'],
    image_url: 'https://images.unsplash.com/photo-1591769225440-811ad7d6eab2?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'golden-retriever',
    name: 'Golden Retriever',
    species: 'Dog',
    aliases: ['Golden'],
    origin: 'Scotland',
    size: 'Large',
    coat: 'Long',
    ears: 'Drop / Floppy',
    build: 'Symmetrical, balanced, deep-chested with feathered coat',
    colors: ['Light Golden', 'Golden', 'Dark Golden', 'Cream'],
    characteristics: ['Dense water-repellent wavy or flat outer coat with heavy feathering', 'Kind and expressive eyes', 'Broad forehead and taper muzzle'],
    identification_tips: 'Distinguished from Labrador by longer feathered hair on legs, chest, and tail, with shades ranging from light cream to rich amber gold.',
    confused_with: ['Labrador Retriever', 'Cocker Spaniel', 'Irish Setter'],
    image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'german-shepherd',
    name: 'German Shepherd Dog',
    species: 'Dog',
    aliases: ['German Shepherd', 'Alsatian', 'GSD'],
    origin: 'Germany',
    size: 'Large',
    coat: 'Double',
    ears: 'Erect',
    build: 'Strong, agile, muscular with sloping backline',
    colors: ['Black and Tan', 'Sable', 'All Black', 'Bi-color'],
    characteristics: ['Pointed erect ears', 'Long bushy tail hanging down', 'Black facial mask with tan saddle pattern', 'Chiseled head with dark almond eyes'],
    identification_tips: 'Look for pronounced erect ears, black saddle and face mask, and sloping hindquarters. Confused with Belgian Malinois, but German Shepherds have a heavier bone structure and longer body proportion.',
    confused_with: ['Belgian Malinois', 'Aspin', 'Siberian Husky'],
    image_url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'belgian-malinois',
    name: 'Belgian Malinois',
    species: 'Dog',
    aliases: ['Malinois', 'Belgian Shepherd'],
    origin: 'Belgium',
    size: 'Large',
    coat: 'Short',
    ears: 'Erect',
    build: 'Square-proportioned, agile, slender yet athletic frame',
    colors: ['Fawn to Mahogany with Black Overlay', 'Fawn with Black Mask'],
    characteristics: ['Prominent black mask and ears', 'Square body stance (not sloping like GSD)', 'Sleek short double coat', 'High carriage and intense gaze'],
    identification_tips: 'Square profile with legs straight under body, lighter and faster build than German Shepherd, always features distinctive dark charcoal mask.',
    confused_with: ['German Shepherd Dog', 'Aspin', 'Dutch Shepherd'],
    image_url: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'shih-tzu',
    name: 'Shih Tzu',
    species: 'Dog',
    aliases: ['Chrysanthemum Dog', 'Lion Dog'],
    origin: 'Tibet / China',
    size: 'Toy',
    coat: 'Long',
    ears: 'Drop / Floppy',
    build: 'Compact, solid, slightly longer than tall with high-set tail',
    colors: ['White and Brown', 'Gold and White', 'Black and White', 'Tricolor', 'Solid Gold'],
    characteristics: ['Flat face / short muzzle (brachycephalic)', 'Large dark round eyes', 'Plumed tail carried over the back', 'Flowing silky double coat'],
    identification_tips: 'Distinctive undershot jaw, short upturned nose, round expressive eyes, and long floor-length or clipped teddy-bear grooming.',
    confused_with: ['Pekingese', 'Lhasa Apso', 'Maltese'],
    image_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'siberian-husky',
    name: 'Siberian Husky',
    species: 'Dog',
    aliases: ['Husky', 'Siberian'],
    origin: 'Siberia / Russia',
    size: 'Medium',
    coat: 'Double',
    ears: 'Erect',
    build: 'Graceful, athletic, compact northern sled dog build',
    colors: ['Black and White', 'Gray and White', 'Copper / Red and White', 'Pure White', 'Agouti'],
    characteristics: ['Striking facial mask markings', 'Almond-shaped eyes (often ice blue, brown, or heterochromatic)', 'Fox-like brush tail', 'Triangular erect ears set close together'],
    identification_tips: 'Look for the stark symmetrical facial mask, ice-blue or bi-colored eyes, and medium compact frame (lighter and smaller than Alaskan Malamutes).',
    confused_with: ['Alaskan Malamute', 'Samoyed', 'German Shepherd'],
    image_url: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'beagle',
    name: 'Beagle',
    species: 'Dog',
    aliases: ['English Beagle'],
    origin: 'United Kingdom',
    size: 'Small',
    coat: 'Short',
    ears: 'Drop / Floppy',
    build: 'Sturdy, hound-like, square muzzle with upright white-tipped tail',
    colors: ['Tricolor (Black, White, Tan)', 'Red and White', 'Lemon and White'],
    characteristics: ['Long broad drop ears with rounded tips', 'White-tipped flag tail', 'Deep brown hazel eyes with pleading expression', 'Weatherproof dense coat'],
    identification_tips: 'Always check for the white tip on the tail (hound flag) and classic tricolor blanket saddle marking with pendulous soft ears.',
    confused_with: ['Basset Hound', 'Foxhound', 'Aspin Mix'],
    image_url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'poodle',
    name: 'Poodle (Toy / Miniature / Standard)',
    species: 'Dog',
    aliases: ['Caniche', 'French Poodle'],
    origin: 'France / Germany',
    size: 'Small',
    coat: 'Curly',
    ears: 'Drop / Floppy',
    build: 'Proud, squarely-built, elegant, springy gait',
    colors: ['White', 'Black', 'Apricot', 'Red', 'Silver', 'Chocolate'],
    characteristics: ['Dense naturally curly moisture-resistant coat', 'Long straight muzzle', 'High-set tail', 'Drop ears covered in long wavy hair'],
    identification_tips: 'Non-shedding tight curly coat and refined narrow muzzle. Varies in size from Toy (<10 in) to Miniature to Standard (>15 in).',
    confused_with: ['Bichon Frise', 'Maltese', 'Goldendoodle'],
    image_url: 'https://images.unsplash.com/photo-1516371535707-512a1e83bb9a?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'chihuahua',
    name: 'Chihuahua',
    species: 'Dog',
    aliases: ['Chi'],
    origin: 'Mexico',
    size: 'Toy',
    coat: 'Short',
    ears: 'Erect',
    build: 'Tiny, graceful, compact terrier-like frame',
    colors: ['Fawn', 'Black and Tan', 'White', 'Chocolate', 'Blue', 'Merle'],
    characteristics: ['Apple-dome skull', 'Large flaring erect ears (bat-like)', 'Luminous large round eyes', 'Sickle tail carried curved over back'],
    identification_tips: 'World smallest dog breed. Distinctive apple-head with prominent flared ears and short pointed muzzle.',
    confused_with: ['Miniature Pinscher', 'Pomeranian', 'Aspin Puppy'],
    image_url: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'pomeranian',
    name: 'Pomeranian',
    species: 'Dog',
    aliases: ['Pom', 'Zwergspitz'],
    origin: 'Germany / Poland',
    size: 'Toy',
    coat: 'Double',
    ears: 'Erect',
    build: 'Compact, spherical puffball silhouette, spirited gait',
    colors: ['Orange', 'Red', 'Cream', 'Black', 'White', 'Sable'],
    characteristics: ['Fox-like face with dark keen eyes', 'Heavily plumed tail lying flat over back', 'Abundant double coat with stand-off ruff', 'Tiny upright pointed ears'],
    identification_tips: 'Extremely fluffy spherical appearance with a fox-like wedge head and tiny pricked ears nestled in a neck ruff.',
    confused_with: ['Spitz', 'Chihuahua Long Coat', 'Samoyed Puppy'],
    image_url: 'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'french-bulldog',
    name: 'French Bulldog',
    species: 'Dog',
    aliases: ['Frenchie'],
    origin: 'France / United Kingdom',
    size: 'Small',
    coat: 'Short',
    ears: 'Erect',
    build: 'Heavy-boned, compact, muscular cobby body with short roach back',
    colors: ['Brindle', 'Fawn', 'Pied (White and Black)', 'Cream', 'Blue'],
    characteristics: ['Distinctive "bat ears" upright and rounded at tips', 'Extremely flat brachycephalic muzzle', 'Wrinkled brow and deep skin folds', 'Naturally short stump tail'],
    identification_tips: 'Erect bat ears are the foolproof identifier compared to English Bulldogs and Pugs who have folded or button ears.',
    confused_with: ['Boston Terrier', 'Pug', 'English Bulldog'],
    image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'pug',
    name: 'Pug',
    species: 'Dog',
    aliases: ['Chinese Pug', 'Carlin'],
    origin: 'China',
    size: 'Small',
    coat: 'Short',
    ears: 'Drop / Floppy',
    build: 'Square, cobby, muscular with barrel chest',
    colors: ['Fawn with Black Mask', 'Solid Black', 'Silver Fawn'],
    characteristics: ['Deep forehead wrinkles', 'Tight curled tail over hip', 'Dark black facial mask and velvety folded ears', 'Short blunt flat muzzle'],
    identification_tips: 'Look for tight spiral tail over hip, deep wrinkles on flat face, and velvet button ears hanging down (unlike Frenchies with bat ears).',
    confused_with: ['French Bulldog', 'English Bulldog', 'Brussels Griffon'],
    image_url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'rottweiler',
    name: 'Rottweiler',
    species: 'Dog',
    aliases: ['Rottie'],
    origin: 'Germany',
    size: 'Large',
    coat: 'Short',
    ears: 'Drop / Floppy',
    build: 'Massive, muscular, robust, broad-skulled working dog',
    colors: ['Black with clearly defined rich rust / mahogany markings'],
    characteristics: ['Broad head with strong jaw', 'Rust tan points over eyes, cheeks, chest, and legs', 'Short dense flat black coat', 'Triangular drop ears hanging forward'],
    identification_tips: 'Stout broad frame with rich mahogany markings over a jet black coat. Distinctly heavier-set and broader than Doberman Pinschers.',
    confused_with: ['Doberman Pinscher', 'Beauceron', 'Pitbull Mix'],
    image_url: 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'doberman-pinscher',
    name: 'Doberman Pinscher',
    species: 'Dog',
    aliases: ['Doberman', 'Dobie'],
    origin: 'Germany',
    size: 'Large',
    coat: 'Short',
    ears: 'Erect',
    build: 'Sleek, muscular, compact, elegant square silhouette',
    colors: ['Black and Rust', 'Red and Rust', 'Blue and Rust', 'Fawn (Isabella) and Rust'],
    characteristics: ['Chiseled wedge head', 'High-set ears (naturally drop or cropped erect)', 'Smooth glossy coat', 'Well-defined rust markings'],
    identification_tips: 'Much leaner, taller, and more streamlined tuck-up abdomen than Rottweilers, with tight short fur and aristocratic posture.',
    confused_with: ['Rottweiler', 'Miniature Pinscher', 'Beauceron'],
    image_url: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'corgi',
    name: 'Pembroke Welsh Corgi',
    species: 'Dog',
    aliases: ['Corgi', 'Pembroke'],
    origin: 'Wales / United Kingdom',
    size: 'Small',
    coat: 'Double',
    ears: 'Erect',
    build: 'Low-set, long body on remarkably short sturdy legs',
    colors: ['Red and White', 'Sable and White', 'Fawn', 'Tricolor (Black, Tan, White)'],
    characteristics: ['Fox-like head and upright rounded-tip ears', 'Short legs with deep chest', 'Very short or docked tail', 'Dense weather-resistant double coat'],
    identification_tips: 'Unmistakable short stature with long torso and erect ears. Pembroke corgis typically lack long tails compared to Cardigan Welsh Corgis.',
    confused_with: ['Cardigan Welsh Corgi', 'Dachshund', 'Shiba Inu Mix'],
    image_url: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'dachshund',
    name: 'Dachshund',
    species: 'Dog',
    aliases: ['Wiener Dog', 'Teckel', 'Doxie'],
    origin: 'Germany',
    size: 'Small',
    coat: 'Short',
    ears: 'Drop / Floppy',
    build: 'Extremely elongated body on very short muscular legs',
    colors: ['Red', 'Black and Tan', 'Chocolate and Tan', 'Dapple / Merle'],
    characteristics: ['Low-slung body silhouette', 'Long conical head and arched snout', 'Long broad drop ears set high', 'Deep keel / breastbone'],
    identification_tips: 'Famous "sausage" elongated torso with dropped floppy ears and paddle-like front paws designed for burrowing.',
    confused_with: ['Basset Hound', 'Corgi', 'Chihuahua Mix'],
    image_url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&auto=format&fit=crop&q=80',
  },

  // 🐱 CATS
  {
    id: 'puspin',
    name: 'Puspin (Pusang Pinoy)',
    species: 'Cat',
    aliases: ['Pusang Pinoy', 'Domestic Shorthair (Philippines)', 'DSH Native'],
    origin: 'Philippines',
    size: 'Medium',
    coat: 'Short',
    ears: 'Erect',
    build: 'Agile, lean, muscular, resilient natural domestic build',
    colors: ['Tabby (Mackerel / Classic)', 'Tuxedo (Black and White)', 'Orange / Ginger', 'Calico / Tortoiseshell', 'Solid White / Black'],
    characteristics: ['Sleek low-maintenance short coat', 'Medium wedge-shaped head with alert upright ears', 'Expressive yellow, green, or hazel eyes', 'Varied natural tail (straight, kinked, or bobbed)'],
    identification_tips: 'The ubiquitous beloved native domestic cat of the Philippines. Shows wide variety of markings with hardy slender athletic build and short glossy fur.',
    confused_with: ['American Shorthair', 'Tabby Cat', 'Siamese Mix'],
    image_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'persian',
    name: 'Persian Cat',
    species: 'Cat',
    aliases: ['Persian', 'Traditional Longhair', 'Shirazi'],
    origin: 'Iran (Persia)',
    size: 'Medium',
    coat: 'Long',
    ears: 'Erect',
    build: 'Cobby, heavy-boned, low-slung, stocky legs, broad chest',
    colors: ['White', 'Silver / Chinchilla', 'Golden', 'Cream', 'Black', 'Blue', 'Bi-color'],
    characteristics: ['Round flat face (brachycephalic) with snub nose', 'Enormous round expressive eyes', 'Massive flowing double coat with magnificent ruff', 'Small rounded ears set low on head'],
    identification_tips: 'Extremely flat face with snub nose centered between eyes, small round ears, and abundant flowing plush long fur.',
    confused_with: ['Exotic Shorthair', 'Himalayan', 'British Longhair'],
    image_url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'siamese',
    name: 'Siamese Cat',
    species: 'Cat',
    aliases: ['Meezer', 'Traditional Siamese', 'Wichien Maat'],
    origin: 'Thailand',
    size: 'Medium',
    coat: 'Short',
    ears: 'Erect',
    build: 'Long, svelte, tubular body, fine boning, elegant graceful neck',
    colors: ['Seal Point', 'Chocolate Point', 'Blue Point', 'Lilac Point'],
    characteristics: ['Striking deep vivid blue almond eyes', 'Colorpoint coat (darker face, ears, paws, and tail against pale body)', 'Triangular wedge head with large flaring ears', 'Long whippy tail'],
    identification_tips: 'Piercing blue almond-shaped eyes paired with dark temperature-sensitive colorpoints on extremities and pale cream fawn body.',
    confused_with: ['Balinese', 'Birman', 'Tonkinese', 'Puspin Colorpoint'],
    image_url: 'https://images.unsplash.com/photo-1513360309081-36f20ca48f2b?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'british-shorthair',
    name: 'British Shorthair',
    species: 'Cat',
    aliases: ['British Blue', 'BSH'],
    origin: 'United Kingdom',
    size: 'Large',
    coat: 'Short',
    ears: 'Erect',
    build: 'Chubby, cobby, muscular with broad round chest and thick sturdy legs',
    colors: ['Blue (Grey)', 'Lilac', 'Cream', 'Silver Tabby', 'Golden Shaded', 'Black'],
    characteristics: ['Teddy-bear appearance with full chubby cheeks', 'Dense crisp plush water-resistant coat', 'Large round copper or golden orange eyes', 'Thick tail with rounded tip'],
    identification_tips: 'Very round cheeks with famous "smiling" whisker pads, round copper eyes, and dense plush coat that cracks as the cat moves.',
    confused_with: ['Russian Blue', 'Chartreux', 'Scottish Straight'],
    image_url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'maine-coon',
    name: 'Maine Coon',
    species: 'Cat',
    aliases: ['Gentle Giant', 'American Longhair'],
    origin: 'United States (Maine)',
    size: 'Giant',
    coat: 'Long',
    ears: 'Erect',
    build: 'Substantial, rectangular long body, broad chest, heavy muscular frame',
    colors: ['Brown Classic Tabby', 'Red Tabby', 'Black Smoke', 'Silver Tabby', 'White'],
    characteristics: ['Lynx-like ear tufts and long ear furnishings', 'Prominent square blunt muzzle', 'Long bushy raccoon-like plume tail', 'Uneven shaggy water-repellent coat with full lion ruff'],
    identification_tips: 'Largest domesticated cat breed. Look for distinct ear tufts at the tips, square lion-like muzzle, and huge bushy plume tail.',
    confused_with: ['Norwegian Forest Cat', 'Siberian Cat', 'Ragdoll'],
    image_url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'bengal',
    name: 'Bengal Cat',
    species: 'Cat',
    aliases: ['Leopard Cat'],
    origin: 'United States',
    size: 'Medium',
    coat: 'Short',
    ears: 'Erect',
    build: 'Muscular, long athletic torso, higher hindquarters, wildcat posture',
    colors: ['Brown Spotted / Rosetted', 'Snow Bengal (Seal Lynx)', 'Silver', 'Charcoal'],
    characteristics: ['Distinctive jaguar rosettes or marble bullseye markings', 'Glitter effect on ultra-soft pelt coat', 'Broad nose with prominent whisker pads', 'Thick dark-tipped tail'],
    identification_tips: 'Unmistakable wild leopard-like rosetted coat with golden shimmer and high hindquarter athletic prowl.',
    confused_with: ['Savannah Cat', 'Egyptian Mau', 'Tabby Puspin'],
    image_url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'ragdoll',
    name: 'Ragdoll',
    species: 'Cat',
    aliases: ['Puppycat'],
    origin: 'United States',
    size: 'Large',
    coat: 'Medium',
    ears: 'Erect',
    build: 'Large, muscular, broad-chested with plush medium-long silky coat',
    colors: ['Seal Point', 'Blue Point', 'Chocolate', 'Lilac', 'Bicolor (White Inverted V on face)'],
    characteristics: ['Deep oval blue eyes', 'Silky non-matting rabbit-like coat', 'Distinctive inverted white "V" blaze on facial mask in bi-color variety', 'Plumed tail'],
    identification_tips: 'Look for the sweet expression with large oval blue eyes and symmetrical inverted white V on the colorpoint mask.',
    confused_with: ['Birman', 'Himalayan', 'Maine Coon'],
    image_url: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'scottish-fold',
    name: 'Scottish Fold',
    species: 'Cat',
    aliases: ['Fold', 'Coupari'],
    origin: 'Scotland',
    size: 'Medium',
    coat: 'Short',
    ears: 'Folded',
    build: 'Compact, round, padded body with medium bone structure',
    colors: ['Solid Blue', 'Silver Tabby', 'White', 'Calico', 'Tortie', 'Cream'],
    characteristics: ['Tightly folded forward and downward ears giving owl-like head', 'Large round open sweet eyes', 'Round domed head with prominent cheeks', 'Medium flexible tail'],
    identification_tips: 'Ears folded flat against skull creating a distinctive circular owl-like head shape.',
    confused_with: ['British Shorthair', 'American Shorthair'],
    image_url: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'russian-blue',
    name: 'Russian Blue',
    species: 'Cat',
    aliases: ['Archangel Cat'],
    origin: 'Russia',
    size: 'Medium',
    coat: 'Short',
    ears: 'Erect',
    build: 'Fine-boned, long graceful foreign body type, slender legs',
    colors: ['Uniform Shimmering Slate Blue / Grey with Silver Tipping'],
    characteristics: ['Vivid luminous emerald green eyes', 'Distinctive double coat with silver frost luster', 'Gentle upturned mouth giving sweet "Mona Lisa" smile', 'Large pointed translucent ears'],
    identification_tips: 'Pure shimmering slate-blue coat with silver frosty sheen and bright emerald green eyes (not copper like British Blues).',
    confused_with: ['British Shorthair', 'Korat', 'Chartreux'],
    image_url: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'sphynx',
    name: 'Sphynx Cat',
    species: 'Cat',
    aliases: ['Hairless Cat', 'Canadian Hairless'],
    origin: 'Canada',
    size: 'Medium',
    coat: 'Hairless',
    ears: 'Erect',
    build: 'Medium boning with potbelly silhouette, muscular warm body',
    colors: ['All skin pigmentations (Pink, Black, Tabby skin, Calico skin)'],
    characteristics: ['Hairless suede-like chamois skin with wrinkles', 'Enormous bat-like ears open at base', 'Lemon-shaped large eyes', 'Long whippy rat-like tail'],
    identification_tips: 'Virtually hairless wrinkled skin with warm chamois peach-fuzz texture and enormous bat ears.',
    confused_with: ['Devon Rex', 'Cornish Rex', 'Peterbald'],
    image_url: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800&auto=format&fit=crop&q=80',
  },
];

/**
 * Normalizes a breed query string for matching.
 */
function normalizeStr(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Computes simple Levenshtein distance between two strings.
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const d: number[][] = [];

  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }

  return d[m][n];
}

/**
 * Finds closest matching breeds from our catalog for a target breed name and optional species.
 */
export function findClosestBreeds(
  targetBreed: string | null | undefined,
  targetSpecies?: string | null,
  limit: number = 4
): PetBreed[] {
  if (!targetBreed || targetBreed.trim() === '' || targetBreed.toLowerCase() === 'unknown') {
    // If no target breed provided, return top recommendations for the species
    const speciesNorm = targetSpecies ? targetSpecies.toLowerCase() : '';
    return PET_BREEDS_CATALOG.filter((b) => {
      if (!speciesNorm || speciesNorm === 'all' || speciesNorm === 'other') return true;
      return b.species.toLowerCase() === speciesNorm;
    }).slice(0, limit);
  }

  const query = targetBreed.trim().toLowerCase();
  const queryNorm = normalizeStr(query);
  const speciesNorm = targetSpecies ? targetSpecies.toLowerCase() : '';

  // Filter candidates by species if specified
  const pool = PET_BREEDS_CATALOG.filter((b) => {
    if (!speciesNorm || speciesNorm === 'all' || speciesNorm === 'other') return true;
    return b.species.toLowerCase() === speciesNorm;
  });

  const scored = pool.map((b) => {
    let score = 0;
    const bNameLower = b.name.toLowerCase();
    const bNameNorm = normalizeStr(b.name);

    // Exact name match
    if (bNameLower === query || bNameNorm === queryNorm) {
      score += 100;
    } 
    // Substring contains
    else if (bNameLower.includes(query) || query.includes(bNameLower)) {
      score += 70;
    }

    // Alias matches
    for (const alias of b.aliases) {
      const aliasLower = alias.toLowerCase();
      const aliasNorm = normalizeStr(alias);
      if (aliasLower === query || aliasNorm === queryNorm) {
        score += 85;
      } else if (aliasLower.includes(query) || query.includes(aliasLower)) {
        score += 55;
      }
    }

    // Confused with matches
    for (const confused of b.confused_with) {
      if (confused.toLowerCase().includes(query) || query.includes(confused.toLowerCase())) {
        score += 60;
      }
    }

    // Levenshtein fuzzy score
    const dist = levenshteinDistance(queryNorm, bNameNorm);
    const maxLen = Math.max(queryNorm.length, bNameNorm.length);
    if (maxLen > 0) {
      const similarity = 1 - dist / maxLen;
      if (similarity > 0.4) {
        score += Math.round(similarity * 40);
      }
    }

    return { breed: b, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.breed);
}

/**
 * Filter breeds with user-selected criteria.
 */
export function filterBreeds(
  breeds: PetBreed[],
  filters: {
    species?: 'All' | 'Dog' | 'Cat' | string;
    search?: string;
    size?: string;
    coat?: string;
  }
): PetBreed[] {
  const { species = 'All', search = '', size = 'All', coat = 'All' } = filters;
  const searchLower = search.trim().toLowerCase();

  return breeds.filter((b) => {
    // Species filter
    if (species !== 'All' && species !== 'other' && b.species.toLowerCase() !== species.toLowerCase()) {
      return false;
    }

    // Size filter
    if (size !== 'All' && b.size.toLowerCase() !== size.toLowerCase()) {
      return false;
    }

    // Coat filter
    if (coat !== 'All' && b.coat.toLowerCase() !== coat.toLowerCase()) {
      return false;
    }

    // Search query
    if (searchLower) {
      const inName = b.name.toLowerCase().includes(searchLower);
      const inAliases = b.aliases.some((a) => a.toLowerCase().includes(searchLower));
      const inColors = b.colors.some((c) => c.toLowerCase().includes(searchLower));
      const inTraits = b.characteristics.some((t) => t.toLowerCase().includes(searchLower));
      const inTips = b.identification_tips.toLowerCase().includes(searchLower);
      const inConfused = b.confused_with.some((c) => c.toLowerCase().includes(searchLower));

      if (!inName && !inAliases && !inColors && !inTraits && !inTips && !inConfused) {
        return false;
      }
    }

    return true;
  });
}
