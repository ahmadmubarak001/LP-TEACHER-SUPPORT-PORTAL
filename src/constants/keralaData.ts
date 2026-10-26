import { ClassLevel, Subject, ResourceType } from '../types';

export interface DistrictInfo {
  id: string;
  name_en: string;
  name_ml: string;
}

export const KERALA_DISTRICTS: DistrictInfo[] = [
  { id: 'tvm', name_en: 'Thiruvananthapuram', name_ml: 'തിരുവനന്തപുരം' },
  { id: 'klm', name_en: 'Kollam', name_ml: 'കൊല്ലം' },
  { id: 'pta', name_en: 'Pathanamthitta', name_ml: 'പത്തനംതിട്ട' },
  { id: 'alp', name_en: 'Alappuzha', name_ml: 'ആലപ്പുഴ' },
  { id: 'ktm', name_en: 'Kottayam', name_ml: 'കോട്ടയം' },
  { id: 'idk', name_en: 'Idukki', name_ml: 'ഇടുക്കി' },
  { id: 'ekm', name_en: 'Ernakulam', name_ml: 'എറണാകുളം' },
  { id: 'tsr', name_en: 'Thrissur', name_ml: 'തൃശ്ശൂർ' },
  { id: 'pkd', name_en: 'Palakkad', name_ml: 'പാലക്കാട്' },
  { id: 'mlp', name_en: 'Malappuram', name_ml: 'മലപ്പുറം' },
  { id: 'kkd', name_en: 'Kozhikode', name_ml: 'കോഴിക്കോട്' },
  { id: 'wyd', name_en: 'Wayanad', name_ml: 'വയനാട്' },
  { id: 'knr', name_en: 'Kannur', name_ml: 'കണ്ണൂർ' },
  { id: 'ksd', name_en: 'Kasaragod', name_ml: 'കാസർഗോഡ്' },
];

export interface ClassInfo {
  level: ClassLevel;
  title_en: string;
  title_ml: string;
  description_en: string;
  description_ml: string;
}

export const LP_CLASSES: ClassInfo[] = [
  { level: 1, title_en: 'Class 1', title_ml: 'ക്ലാസ് 1', description_en: 'Foundation stage learning, letter recognition, early numeracy', description_ml: 'അക്ഷര പഠനം, ആദ്യകാല ഗണിത ശേഷികൾ, കളികളിലൂടെയുള്ള പഠനം' },
  { level: 2, title_en: 'Class 2', title_ml: 'ക്ലാസ് 2', description_en: 'Reading fluency, basic arithmetic, environmental curiosity', description_ml: 'വായനാ ശീലം, അടിസ്ഥാന ഗണിത ക്രിയകൾ, ലഘു പരിസരപഠനം' },
  { level: 3, title_en: 'Class 3', title_ml: 'ക്ലാസ് 3', description_en: 'Comprehension, word problems, science inquiry', description_ml: 'ആശയഗ്രഹണം, പ്രായോഗിക ഗണിതം, പ്രകൃതി നിരീക്ഷണം' },
  { level: 4, title_en: 'Class 4', title_ml: 'ക്ലാസ് 4', description_en: 'Advanced primary concepts, creative expression, project work', description_ml: 'ഉന്നത പ്രൈമറി ആശയങ്ങൾ, സർഗ്ഗാത്മക രചനകൾ, ലഘു പ്രോജക്റ്റുകൾ' },
];

export interface SubjectInfo {
  id: Subject;
  name_en: string;
  name_ml: string;
  iconName: string;
  color: string;
}

export const LP_SUBJECTS: SubjectInfo[] = [
  { id: 'malayalam', name_en: 'Malayalam', name_ml: 'മലയാളം', iconName: 'BookOpen', color: 'emerald' },
  { id: 'english', name_en: 'English', name_ml: 'ഇംഗ്ലീഷ്', iconName: 'Globe', color: 'blue' },
  { id: 'mathematics', name_en: 'Mathematics', name_ml: 'ഗണിതം', iconName: 'Calculator', color: 'amber' },
  { id: 'environmental_studies', name_en: 'Environmental Studies', name_ml: 'പരിസരപഠനം', iconName: 'Leaf', color: 'teal' },
  { id: 'arts_crafts', name_en: 'Arts & Crafts', name_ml: 'കലാ കായിക പ്രവൃത്തിപരിചയം', iconName: 'Palette', color: 'rose' },
  { id: 'ict', name_en: 'ICT & Digital Aids', name_ml: 'ഐ.സി.ടി / ഡിജിറ്റൽ സഹായി', iconName: 'Laptop', color: 'purple' },
  { id: 'general', name_en: 'General / Activities', name_ml: 'പൊതു പാഠ്യസാമഗ്രികൾ', iconName: 'Sparkles', color: 'indigo' },
];

export interface ResourceTypeInfo {
  id: ResourceType;
  name_en: string;
  name_ml: string;
}

export const RESOURCE_TYPES: ResourceTypeInfo[] = [
  { id: 'lesson_plan', name_en: 'Lesson Plan', name_ml: 'പാഠാസൂത്രണം' },
  { id: 'worksheet', name_en: 'Worksheet', name_ml: 'വർക്ക്ഷീറ്റ്' },
  { id: 'question_paper', name_en: 'Evaluation / Question Pool', name_ml: 'മൂല്യനിർണ്ണയ സഹായി' },
  { id: 'teaching_aid', name_en: 'Teaching Aid (TLM)', name_ml: 'പഠനോപകരണം (TLM)' },
  { id: 'audio_visual', name_en: 'Audio-Visual Guide', name_ml: 'ശ്രവ്യ-ദൃശ്യ മാധ്യമം' },
  { id: 'handbook', name_en: 'Teacher Handbook', name_ml: 'അധ്യാപക സഹായി' },
  { id: 'activity_card', name_en: 'Activity Card', name_ml: 'പഠന കാർഡുകൾ' },
];
