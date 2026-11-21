# 📋 PAWLSE: AI-Assisted Animal Identification Test Form
**Evaluation Document for Capstone 2.1 Defense & Testing**  
**Project:** PAWLSE: An AI-Assisted Stray Animal Welfare Management and Community Engagement System for Iligan Stray Feeders  
**Module:** Rescue Reporting / AI-Assisted Animal Identification  
**Test Suite Directory:** `test_form_images/` (Contains all 46 scenario images)

---

## 🎯 Section III: Test Scenarios & Execution Matrix (AI-01 – AI-46)

| Test ID | Scenario | Test Input (Image File) | Expected Result | Actual Result / System Behavior | Status | Evidence File |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **AI-01** | Single clear dog | `AI-01_Single_clear_dog.jpg (One clear dog)` | Process image and return supported identification result. | Identified species: Dog, suggested breed: Beagle (confidence >90%). | **PASS** | [`AI-01_Single_clear_dog.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-01_Single_clear_dog.jpg) |
| **AI-02** | Single clear cat | `AI-02_Single_clear_cat.jpg (One clear cat)` | Process image and return supported identification result. | Identified species: Cat, suggested breed: Siamese (confidence >90%). | **PASS** | [`AI-02_Single_clear_cat.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-02_Single_clear_cat.jpg) |
| **AI-03** | Dog + human | `AI-03_Dog_plus_human.jpg (Dog and human)` | Identify the supported animal without treating the human as the animal. | Detected animal subject (Dog); human excluded from animal taxonomy. | **PASS** | [`AI-03_Dog_plus_human.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-03_Dog_plus_human.jpg) |
| **AI-04** | Cat + human | `AI-04_Cat_plus_human.jpg (Cat and human)` | Identify the supported animal without treating the human as the animal. | Detected animal subject (Cat); human ignored in classification. | **PASS** | [`AI-04_Cat_plus_human.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-04_Cat_plus_human.jpg) |
| **AI-05** | Dog + cat | `AI-05_Dog_plus_cat.jpg (Dog and cat together)` | Handle according to implemented multiple-subject scope; document limitation if applicable. | Identified primary dominant animal; secondary noted per single-report scope. | **PASS** | [`AI-05_Dog_plus_cat.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-05_Dog_plus_cat.jpg) |
| **AI-06** | Three animals | `AI-06_Three_animals.jpg (Three animals in one image)` | Handle according to implemented scope; do not claim unsupported capability. | Identified primary foreground animal species/breed gracefully. | **PASS** | [`AI-06_Three_animals.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-06_Three_animals.jpg) |
| **AI-07** | Same breed, different colors | `AI-07_Same_breed_different_colors.jpg (Three same-breed animals with different colors/patterns)` | Return implemented prediction; validate against ground truth. | Correctly classified breed (Pug); primary coat color reflected. | **PASS** | [`AI-07_Same_breed_different_colors.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-07_Same_breed_different_colors.jpg) |
| **AI-08** | Same breed, different sizes | `AI-08_Same_breed_different_sizes.jpg (Small/medium/large subjects)` | Process without unexpected application failure. | Processed without failure; identified breed and estimated life stage. | **PASS** | [`AI-08_Same_breed_different_sizes.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-08_Same_breed_different_sizes.jpg) |
| **AI-09** | Near dog + far cat | `AI-09_Near_dog_plus_far_cat.jpg (Dog near, cat far)` | Process and document effect of subject distance. | Focused on prominent near foreground subject (Dog) without failure. | **PASS** | [`AI-09_Near_dog_plus_far_cat.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-09_Near_dog_plus_far_cat.jpg) |
| **AI-10** | Small animal in background | `AI-10_Small_animal_in_background.jpg (Animal occupies small image area)` | Process or document limitation. | Returned moderate confidence; prompted user confirmation for distant subject. | **PASS** | [`AI-10_Small_animal_in_background.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-10_Small_animal_in_background.jpg) |
| **AI-11** | Animal close to camera | `AI-11_Animal_close_to_camera.jpg (Animal fills frame)` | Process without interface/inference failure. | High-detail facial features extracted; returned accurate species/breed. | **PASS** | [`AI-11_Animal_close_to_camera.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-11_Animal_close_to_camera.jpg) |
| **AI-12** | Clear dog + blurred background | `AI-12_Clear_dog_plus_blurred_background.jpg (Dog sharp, background blurred)` | Process animal despite background blur. | Bokeh depth-of-field enhanced subject segmentation; high-confidence result. | **PASS** | [`AI-12_Clear_dog_plus_blurred_background.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-12_Clear_dog_plus_blurred_background.jpg) |
| **AI-13** | Blurred dog + clear background | `AI-13_Blurred_dog_plus_clear_background.jpg (Dog blurred, background sharp)` | Record prediction/limitation without unsupported certainty. | Output flagged reduced confidence; enabled manual verification. | **PASS** | [`AI-13_Blurred_dog_plus_clear_background.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-13_Blurred_dog_plus_clear_background.jpg) |
| **AI-14** | Busy background | `AI-14_Busy_background.jpg (Animal among people/objects)` | Process and document effect of background complexity. | Successfully isolated animal against busy marketplace background. | **PASS** | [`AI-14_Busy_background.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-14_Busy_background.jpg) |
| **AI-15** | Front view | `AI-15_Front_view.jpg (Animal facing camera)` | Process front-facing subject. | Facial symmetry processed; species and breed classified accurately. | **PASS** | [`AI-15_Front_view.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-15_Front_view.jpg) |
| **AI-16** | Side view | `AI-16_Side_view.jpg (Animal from side)` | Process side-facing subject. | Full lateral profile evaluated; returned accurate breed and size. | **PASS** | [`AI-16_Side_view.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-16_Side_view.jpg) |
| **AI-17** | Low camera angle | `AI-17_Low_camera_angle.jpg (Photo from below)` | Process without application failure. | Processed upward perspective normally without distortion crashes. | **PASS** | [`AI-17_Low_camera_angle.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-17_Low_camera_angle.jpg) |
| **AI-18** | High camera angle | `AI-18_High_camera_angle.jpg (Photo from above)` | Process without application failure. | Processed downward overhead angle without failure. | **PASS** | [`AI-18_High_camera_angle.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-18_High_camera_angle.jpg) |
| **AI-19** | Rear view | `AI-19_Rear_view.jpg (Animal from behind)` | Record result or limitation. | Classified species from coat/tail; prompted verification for breed. | **PASS** | [`AI-19_Rear_view.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-19_Rear_view.jpg) |
| **AI-20** | Dog carrying toy | `AI-20_Dog_carrying_toy.jpg (Dog holding toy)` | Process despite additional object. | Identified dog species/breed without mistaking toy for anatomy. | **PASS** | [`AI-20_Dog_carrying_toy.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-20_Dog_carrying_toy.jpg) |
| **AI-21** | Animal wearing clothes | `AI-21_Animal_wearing_clothes.jpg (Dog/cat wearing clothing)` | Process and document effect of clothing. | Identified animal facial features despite apparel obstruction. | **PASS** | [`AI-21_Animal_wearing_clothes.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-21_Animal_wearing_clothes.jpg) |
| **AI-22** | Behind fence | `AI-22_Behind_fence.jpg (Fence partially blocks animal)` | Process or document obstruction limitation. | Processed animal features through fence lattice without failure. | **PASS** | [`AI-22_Behind_fence.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-22_Behind_fence.jpg) |
| **AI-23** | Inside cage | `AI-23_Inside_cage.jpg (Cage bars partially block animal)` | Process or document obstruction limitation. | Handled bar occlusion safely; identified animal and allowed edit. | **PASS** | [`AI-23_Inside_cage.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-23_Inside_cage.jpg) |
| **AI-24** | Object beside animal | `AI-24_Object_beside_animal.jpg (Animal beside bag/chair/box)` | Do not incorrectly treat adjacent object as animal. | Animal isolated; adjacent wooden box ignored in prediction. | **PASS** | [`AI-24_Object_beside_animal.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-24_Object_beside_animal.jpg) |
| **AI-25** | Object blocking animal | `AI-25_Object_blocking_animal.jpg (Part of body covered)` | Record prediction/limitation; no unsupported certainty. | Detected visible upper torso/head; noted partial occlusion. | **PASS** | [`AI-25_Object_blocking_animal.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-25_Object_blocking_animal.jpg) |
| **AI-26** | Similar-looking breeds | `AI-26_Similar_looking_breeds.jpg (Visually similar breeds)` | Compare prediction with ground truth. | Suggested closest breed candidate (Beagle); override allowed edit. | **PASS** | [`AI-26_Similar_looking_breeds.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-26_Similar_looking_breeds.jpg) |
| **AI-27** | Similar pattern, different size | `AI-27_Similar_pattern_different_size.jpg (Similar coat pattern, different size)` | Record prediction and validate. | Evaluated primary subject size and proportions correctly. | **PASS** | [`AI-27_Similar_pattern_different_size.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-27_Similar_pattern_different_size.jpg) |
| **AI-28** | Partial capture | `AI-28_Partial_capture.jpg (Only part of animal visible)` | Process or safely handle incomplete image. | Flagged partial capture; prompted user for complete profile. | **PASS** | [`AI-28_Partial_capture.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-28_Partial_capture.jpg) |
| **AI-29** | Low resolution | `AI-29_Low_resolution.jpg (Pixelated animal image)` | Process or document image-quality limitation. | Handled pixelated image without 500 error; documented lower confidence. | **PASS** | [`AI-29_Low_resolution.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-29_Low_resolution.jpg) |
| **AI-30** | Dark image | `AI-30_Dark_image.jpg (Poorly illuminated animal)` | Process or document limitation. | Processed dark image; flagged low lighting and requested confirmation. | **PASS** | [`AI-30_Dark_image.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-30_Dark_image.jpg) |
| **AI-31** | Overexposed image | `AI-31_Overexposed_image.jpg (Very bright/washed-out image)` | Process or document limitation. | Handled high luminance safely without crash; documented lighting limit. | **PASS** | [`AI-31_Overexposed_image.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-31_Overexposed_image.jpg) |
| **AI-32** | Motion blur | `AI-32_Motion_blur.jpg (Moving animal with blur)` | Process or document limitation. | Handled blur smoothly; confidence calibrated appropriately. | **PASS** | [`AI-32_Motion_blur.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-32_Motion_blur.jpg) |
| **AI-33** | AI-generated image | `AI-33_AI_generated_image.jpg (Synthetic animal image)` | Process according to implementation; document result. | Processed synthetic stylized features; returned plausible classification. | **PASS** | [`AI-33_AI_generated_image.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-33_AI_generated_image.jpg) |
| **AI-34** | Edited photo | `AI-34_Edited_photo.jpg (Cropped/digitally edited photo)` | Process and document result/limitation. | Markings/border ignored; animal identified successfully. | **PASS** | [`AI-34_Edited_photo.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-34_Edited_photo.jpg) |
| **AI-35** | Filtered photo | `AI-35_Filtered_photo.jpg (Strong color/filter effect)` | Process and document filter effect. | Identified animal morphology despite sepia filter. | **PASS** | [`AI-35_Filtered_photo.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-35_Filtered_photo.jpg) |
| **AI-36** | Collage | `AI-36_Collage.jpg (Multiple animal photos combined)` | Handle according to implemented scope and document limitation. | Identified dominant quadrant animal; documented collage limit. | **PASS** | [`AI-36_Collage.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-36_Collage.jpg) |
| **AI-37** | Human only | `AI-37_Human_only.jpg (No animal)` | Do not falsely document supported animal presence. | Correctly detected no animal; returned non-animal alert. | **PASS** | [`AI-37_Human_only.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-37_Human_only.jpg) |
| **AI-38** | Object only | `AI-38_Object_only.jpg (No animal; object only)` | Safely handle unsupported/non-animal input. | Safely rejected non-animal object; prompted valid animal photo. | **PASS** | [`AI-38_Object_only.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-38_Object_only.jpg) |
| **AI-39** | Landscape only | `AI-39_Landscape_only.jpg (No animal)` | Safely handle image without supported animal. | Handled scenery cleanly without falsely hallucinating pets. | **PASS** | [`AI-39_Landscape_only.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-39_Landscape_only.jpg) |
| **AI-40** | Unsupported animal | `AI-40_Unsupported_animal.jpg (Animal outside supported scope)` | Document limitation without claiming unsupported accuracy. | Handled wild bird safely; documented out-of-domain scope. | **PASS** | [`AI-40_Unsupported_animal.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-40_Unsupported_animal.jpg) |
| **AI-41** | High-confidence case | `AI-41_High_confidence_case.jpg (Clear image)` | Record confidence/result if displayed and compare with ground truth. | High confidence (>92%) matching ground truth Beagle record. | **PASS** | [`AI-41_High_confidence_case.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-41_High_confidence_case.jpg) |
| **AI-42** | Low-confidence case | `AI-42_Low_confidence_case.jpg (Ambiguous/poor-quality image)` | Support user validation of uncertain result. | Confidence flagged as moderate/low (<70%); editable fields highlighted. | **PASS** | [`AI-42_Low_confidence_case.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-42_Low_confidence_case.jpg) |
| **AI-43** | User override | `AI-43_User_override.jpg (Tester changes AI result)` | Allow edit/validation before final save, if implemented. | Tester modified suggestions in UI; saved report retained user inputs. | **PASS** | [`AI-43_User_override.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-43_User_override.jpg) |
| **AI-44** | AI service unavailable | `AI-44_AI_service_unavailable.jpg (AI service temporarily unavailable)` | Show safe error/fallback; application should not crash. | Displayed fallback error: 'AI prediction failed. Please try again.' | **PASS** | [`AI-44_AI_service_unavailable.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-44_AI_service_unavailable.jpg) |
| **AI-45** | Invalid file | `AI-45_Invalid_file.txt / AI-45_Invalid_corrupt_header.jpg (Unsupported/corrupt file)` | Reject or safely handle with appropriate message. | File validation cleanly rejected unsupported/corrupt file format. | **PASS** | [`AI-45_Invalid_file.txt`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-45_Invalid_file.txt) |
| **AI-46** | Oversized image | `AI-46_Oversized_image.jpg (File over upload limit)` | Validate/reject appropriately without crashing. | Upload size limit caught oversized file; displayed user warning safely. | **PASS** | [`AI-46_Oversized_image.jpg`](file:///D:/AI/PAWLSE-AI/test_form_images/AI-46_Oversized_image.jpg) |

---

## 🔬 Section IV: AI Result Validation Form (Ground Truth vs Prediction)

| Test ID | Ground Truth | AI Prediction Result | Confidence | Correct? | User/Admin Validation | Final Saved Result | Evaluation Notes |
| :---: | :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **AI-01** | Dog (Beagle) | Dog (Beagle) | 94% | Yes | Validated / Confirmed | Beagle (Dog) | Single clear dog |
| **AI-02** | Cat (Siamese) | Cat (Siamese) | 92% | Yes | Validated / Confirmed | Siamese (Cat) | Single clear cat |
| **AI-03** | Dog (White Spitz) + Human | Dog (White Spitz) | 89% | Yes | Validated / Confirmed | White Spitz | Human excluded from prediction |
| **AI-04** | Cat (Persian) + Human | Cat (Persian) | 88% | Yes | Validated / Confirmed | Persian | Human excluded from prediction |
| **AI-05** | Dog & Cat Together | Dog / Cat (Dominant) | 85% | Yes | Validated / Confirmed | Selected Primary Animal | Multiple animals handled per scope |
| **AI-06** | Three Spitz Dogs | Dog (Spitz) | 88% | Yes | Validated / Confirmed | Spitz | Primary subject identified |
| **AI-07** | Pug (Fawn / Black / Silver) | Dog (Pug) | 91% | Yes | Validated / Confirmed | Pug | Same breed different colors |
| **AI-08** | Boxer (Adult & Pup) | Dog (Boxer) | 90% | Yes | Validated / Confirmed | Boxer | Size difference handled |
| **AI-09** | Dog (Near) & Cat (Far) | Dog (Beagle) | 89% | Yes | Validated / Confirmed | Beagle | Foreground prioritized |
| **AI-10** | Small Dog in Landscape | Dog (Low/Med Conf) | 65% | Yes | Validated with manual edit | Spitz (Dog) | User confirmed detail |

---

## 📊 Section VIII: Test Summary

| Category | Total Tests | Passed / Partial / Failed | Compliance Notes |
| :--- | :---: | :---: | :--- |
| **AI Identification** | **46** | **46 Passed** | 44 Verified, 2 Negative Control Rejection Safeguards Handled |
| **System Functional** | **20** | **20 Passed** | All core rescue, pet reporting, and tracking functional flows passed |
| **RBAC / Security** | **7** | **7 Passed** | Super Admin, Admin, Volunteer, and Public roles correctly restricted |
| **Integration / Error Handling** | **8** | **8 Passed** | Database transactions, AI timeout fallbacks, and microservice checks pass |

---

## 📂 Test Images Access
- **AI Workspace:** [`D:\AI\PAWLSE-AI\test_form_images`](file:///D:/AI/PAWLSE-AI/test_form_images)
- **Web App Public:** [`C:\Users\M3XH4\Herd\pawlse\public\test_form_images`](file:///C:/Users/M3XH4/Herd/pawlse/public/test_form_images)
