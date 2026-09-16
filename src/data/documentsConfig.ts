import { DocMetaInfo } from '../types';

export const DOC_LIST: DocMetaInfo[] = [
  // 1. وثائق المخازن
  {
    key: 'bon_sortie',
    title: 'وصل خروج',
    subtitleFr: 'BON DE SORTIE',
    group: 'وثائق المخازن',
    description: 'تسجيل خروج المواد والأدوات والتجهيزات من مخازن المؤسسة وفق الأصول الرسمية'
  },
  {
    key: 'talab_wasail',
    title: 'طلب وسائل',
    group: 'وثائق المخازن',
    description: 'طلب رسمي لتوفير الوسائل والمواد الاستهلاكية والتجهيزات لمصالح المؤسسة'
  },
  {
    key: 'pv_magasin',
    title: 'محضر معاينة مخزن المواد الغذائية',
    group: 'وثائق المخازن',
    description: 'معاينة دورية لنظافة المخزن ومطابقة بطاقات المخزون وصلاحية السلع الاستهلاكية'
  },

  // 2. طلبات ووثائق العمال
  {
    key: 'rokhsa_khouroj',
    title: 'رخصة خروج أثناء العمل',
    group: 'طلبات ووثائق العمال',
    description: 'ترخيص إداري رسمي لخروج الموظف أو العامل لغرض محدد وتوقيت دقيق'
  },
  {
    key: 'taskhir',
    title: 'تسخير العمال',
    group: 'طلبات ووثائق العمال',
    description: 'أمر تسخير موظفين وعمال للقيام بأعمال استثنائية وطارئة للمصلحة العامة'
  },
  {
    key: 'istifsar',
    title: 'استفسار إداري',
    group: 'طلبات ووثائق العمال',
    description: 'مساءلة إدارية كتابية بخصوص إخلال بالانضباط أو غياب مع إتاحة حق الرد'
  },
  {
    key: 'talab_ghiyab',
    title: 'طلب غياب',
    group: 'طلبات ووثائق العمال',
    description: 'طلب رسمي يقدمه الموظف مسبقًا للحصول على موافقة بالغياب المبرر'
  },
  {
    key: 'talab_taawid',
    title: 'طلب تعويض يوم عمل',
    group: 'طلبات ووثائق العمال',
    description: 'طلب تعويض يوم عمل تم أداؤه خارج الأوقات الرسمية أو أثناء العطل'
  },
  {
    key: 'wathiqat_ittisal',
    title: 'وثيقة اتصال وتكليف',
    group: 'طلبات ووثائق العمال',
    description: 'تبليغ رسمي أو تكليف بمهمة محددة موجه مباشرة لأحد العمال أو الموظفين'
  },

  // 3. السكنات والمفاتيح
  {
    key: 'pv_sakanat',
    title: 'محضر معاينة السكنات الوظيفية',
    group: 'السكنات والمفاتيح',
    description: 'فحص تقني لحالة السكن الوظيفي من حيث النظافة والطلاء وشبكات الصيانة'
  },
  {
    key: 'muqarrara_mafatih',
    title: 'مقررة تسليم مفاتيح المحلات',
    group: 'السكنات والمفاتيح',
    description: 'وثيقة قانونية لتسليم وحصر مفاتيح الأجنحة والمكاتب والمخابر والورشات'
  },

  // 4. متابعة العمال
  {
    key: 'arqam_hawatif',
    title: 'دليل أرقام هواتف العمال',
    group: 'متابعة العمال',
    description: 'سجل الاتصال السريع بجميع العمال المهنيين وموظفي الخدمات'
  },
  {
    key: 'barnamij_fardi',
    title: 'البرنامج الفردي لتوزيع المهام',
    group: 'متابعة العمال',
    description: 'جدول أسبوعي تفصيلي لتوقيت ومهام عامل بعينه بما في ذلك المداومة'
  },
  {
    key: 'barnamij_sanawi',
    title: 'البرنامج السنوي لتوزيع مهام العمال',
    group: 'متابعة العمال',
    description: 'جدول سنوي شامل لتوزيع المهام اليومية والمداومة على جميع العمال'
  },
  {
    key: 'jadwal_ghiyabat',
    title: 'جدول متابعة الغيابات الشهري',
    group: 'متابعة العمال',
    description: 'مصفوفة إحصائية شهرية لتتبع غيابات العمال (مبرر، غير مبرر، تعويض)'
  },
  {
    key: 'kashf_hudur',
    title: 'كشف الحضور اليومي للعمال',
    group: 'متابعة العمال',
    description: 'سجل الإمضاء اليومي وساعات الدخول والخروج وفترات الرجوع للعمال'
  },
  {
    key: 'wathiqat_istilam_hurras',
    title: 'استلام المهام بين الحراس',
    group: 'متابعة العمال',
    description: 'محضر تسليم واستلام الحراسة اليومية بين حارس الصباح وحارس الليل'
  },

  // 5. التقارير
  {
    key: 'taqrir_khidma_dakhiliya',
    title: 'تقرير مسؤول الخدمة الداخلية',
    group: 'التقارير',
    description: 'تقرير يومي شامل لحالة المحلات، النظافة، التدفئة، الإنارة، والتأخرات'
  },
  {
    key: 'taqrir_qayim',
    title: 'تقرير القيم اليومي',
    group: 'التقارير',
    description: 'بيان الأعمال المنجزة والمواد المستهلكة في الصيانة والملاحظات الفنية'
  }
];

export const SIMPLE_DOCS_SPEC: Record<string, any> = {
  bon_sortie: {
    title: 'وصل خروج مواد',
    subtitleFr: 'BON DE SORTIE',
    fields: [
      { id: 'number', label: 'رقم الوصل', type: 'number' },
      { id: 'name', label: 'الاسم' },
      { id: 'lastname', label: 'اللقب' },
      { id: 'quality', label: 'الصفة / الرتبة' },
      { id: 'reason', label: 'السبب أو الغرض' },
      { id: 'section', label: 'القسم أو المصلحة الطالبة' }
    ],
    table: {
      label: 'بيان المواد والتجهيزات المسلّمة',
      columns: [
        { id: 'date', label: 'التاريخ', type: 'date' },
        { id: 'designation', label: 'التعيين والوصف' },
        { id: 'qty', label: 'الكمية', type: 'number' },
        { id: 'obs', label: 'الملاحظات' }
      ],
      rows: 6
    },
    signatures: ['المستلم (Le preneur)', 'مسؤول المخزن (Le responsable magasin)']
  },
  talab_wasail: {
    title: 'طلب وسائل ومواد',
    intro: 'أطلب من سيادتكم توفير الوسائل والأدوات والمواد والأجهزة المذكورة أسفله لتسيير المصلحة.',
    fields: [
      { id: 'applicantName', label: 'أنا الممضي أسفله السيد (ة) — رئيس المصلحة (الطالب)' },
      { id: 'applicantJob', label: 'الوظيفة', type: 'job' },
      { id: 'requestDate', label: 'تاريخ الطلب', type: 'date' },
      { id: 'execDate', label: 'تاريخ التنفيذ المطلوب', type: 'date' }
    ],
    table: {
      label: 'قائمة الوسائل والمواد المطلوبة',
      columns: [
        { id: 'designation', label: 'اسم الوسيلة أو الجهاز أو المادة المطلوبة' },
        { id: 'qty', label: 'الكمية المطلوبة', type: 'number' },
        { id: 'note', label: 'ملاحظات وتخصيص' }
      ],
      rows: 10,
      numbered: true
    },
    signatures: ['إمضاء رئيس المصلحة (الطالب)', 'إمضاء وختم مدير المؤسسة']
  },
  rokhsa_khouroj: {
    title: 'رخصة خروج أثناء العمل',
    fields: [
      { id: 'number', label: 'رقم الرخصة', type: 'number' },
      { id: 'name', label: 'يرخص للسيد (ة)' },
      { id: 'job', label: 'الوظيفة / الرتبة', type: 'job' },
      { id: 'day', label: 'بتاريخ يوم', type: 'date' },
      { id: 'purpose', label: 'لغرض' },
      { id: 'exitTime', label: 'بالخروج على الساعة', type: 'time' },
      { id: 'returnTime', label: 'والعودة على الساعة', type: 'time' }
    ],
    note: 'ملاحظة: أي تأخر بعد هذا الموعد يعتبر خروجًا من العمل بدون ترخيص مما يعرض صاحبه للإجراءات المنصوص عليها قانونًا بهذا الشأن.',
    signatures: ['رئيس العمال', 'المقتصد', 'المدير']
  },
  istifsar: {
    title: 'استفسار إداري',
    fields: [
      { id: 'sendNumber', label: 'إرسال رقم' },
      { id: 'refDate', label: 'المرجع (تقرير مصلحة الاقتصاد / تقرير مسؤول خ.د ليوم)', type: 'date' },
      { id: 'employeeName', label: 'السيد (ة)' },
      { id: 'employeeJob', label: 'الوظيفة', type: 'job' },
      { id: 'employeeStatus', label: 'الصفة / المنصب' }
    ],
    textareas: [
      { id: 'requestText', label: 'استنادًا إلى المرجع المذكور أعلاه، يطلب منكم تبرير ما يأتي' },
      { id: 'responseText', label: 'جواب المعني بالأمر' },
      { id: 'directorDecision', label: 'قرار السيد مدير المؤسسة' }
    ],
    note: 'التوزيع: — المعني (ة) بالأمر   — الملف الإداري بمصلحة الموظفين',
    signatures: ['إمضاء المعني (ة)', 'توقيع وختم المدير']
  },
  talab_ghiyab: {
    title: 'طلب رخصة غياب',
    intro: 'يشرفني أن أتقدم إلى سيادتكم المحترمة بطلب رخصة غياب وفق البيانات التالية:',
    fields: [
      { id: 'employeeName', label: 'السيد (ة)' },
      { id: 'employeeJob', label: 'الوظيفة', type: 'job' },
      { id: 'duration', label: 'المدة المطلوبة' },
      { id: 'fromDay', label: 'ابتداءً من يوم', type: 'date' },
      { id: 'toDay', label: 'إلى غاية يوم', type: 'date' }
    ],
    textareas: [
      { id: 'reasons', label: 'وهذا للأسباب والمبررات التالية' },
      { id: 'directorDecision', label: 'قرار ورأي مدير المؤسسة' }
    ],
    signatures: ['إمضاء صاحب الطلب', 'توقيع وختم المدير']
  },
  talab_taawid: {
    title: 'طلب تعويض يوم عمل',
    intro: 'يشرفني أن أتقدم إلى سيادتكم بطلب الاستفادة من يوم تعويضي وفق الآتي:',
    fields: [
      { id: 'employeeName', label: 'السيد (ة)' },
      { id: 'employeeJob', label: 'الوظيفة', type: 'job' },
      { id: 'duration', label: 'المدة' },
      { id: 'fromDay', label: 'ابتداءً من يوم', type: 'date' },
      { id: 'toDay', label: 'إلى غاية يوم', type: 'date' },
      { id: 'compensationDay', label: 'تعويضًا لعمل مؤدى بتاريخ يوم', type: 'date' },
      { id: 'reason', label: 'سبب وطبيعة العمل المؤدى سابقًا' }
    ],
    textareas: [
      { id: 'directorDecision', label: 'قرار ورأي مدير المؤسسة' }
    ],
    signatures: ['إمضاء صاحب الطلب', 'توقيع وختم المدير']
  },
  wathiqat_ittisal: {
    title: 'وثيقة اتصال وتكليف بمهمة',
    fields: [
      { id: 'subject', label: 'الموضوع' },
      { id: 'reference', label: 'المرجع الإداري' },
      { id: 'toEmployee', label: 'إلى السيد (ة)' }
    ],
    textareas: [
      { id: 'body', label: 'نص التكليف / التعليمات الإدارية والمهمة الموكلة' }
    ],
    note: 'في حالة الرفض أو وجود مانع قانوني أو صحي، يقدم المعني بالأمر توضيحاته المكتوبة خلف هذه الوثيقة.',
    signatures: ['إمضاء وتبليغ المعني (ة)', 'توقيع المقتصد / المدير']
  },
  muqarrara_mafatih: {
    title: 'مقررة تسليم مفاتيح المحلات والمرافق',
    refline: 'المرجع: المنشور الوزاري رقم 143/97 المتعلق بحماية وتأمين المؤسسات التربوية',
    fields: [
      { id: 'number', label: 'رقم المقررة', type: 'number' },
      { id: 'date', label: 'بتاريخ', type: 'date' },
      { id: 'personA_name', label: 'المسلم (السيد / السيدة)' },
      { id: 'personA_job', label: 'الوظيفة', type: 'job' },
      { id: 'personB_name', label: 'المستلم (السيد / السيدة)' },
      { id: 'personB_job', label: 'الوظيفة', type: 'job' }
    ],
    table: {
      label: 'بيان المحلات والمفاتيح المسلمة',
      columns: [
        { id: 'wing', label: 'رقم الجناح' },
        { id: 'room', label: 'رقم المحل أو المكتب' },
        { id: 'purpose', label: 'طبيعة المحل / التخصص' },
        { id: 'keys', label: 'عدد المفاتيح', type: 'number' },
        { id: 'lock', label: 'طبيعة ونوع القفل' },
        { id: 'doors', label: 'عدد الأبواب', type: 'number' }
      ],
      rows: 5
    },
    staticNotes: [
      'على الموظفين اتخاذ كافة تدابير الحيطة والوقاية بالمحلات المسندة لهم، وذلك بإطفاء الأنوار عند نهاية العمل.',
      'التأكد التام من إحكام غلق الأبواب والنوافذ وصنابير المياه بعد مغادرة الأماكن.',
      'عدم ترك المدافئ الكهربائية أو الغازية والتجهيزات المكتبية في حالة اشتغال دون رقابة.',
      'يجب تبليغ مدير المؤسسة أو المقتصد كتابيًا وفورًا عن أي عطب أو خلل يصيب أي قفل لاتخاذ إجراءات الصيانة أو التغيير.',
      'في نهاية السنة الدراسية يلزم كل موظف بإعادة مفتاح المحل المسند إليه لحفظه في ظرف مغلق لدى الإدارة حسب الإجراءات المعمول بها.'
    ],
    signatures: ['توقيع المستلم', 'مقتصد المؤسسة', 'مدير المؤسسة']
  }
};
