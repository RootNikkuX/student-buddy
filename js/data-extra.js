
/* ---------- more sports ---------- */
EV.push(
{id:'kia',t:'sports',e:'🥇',n:'Khelo India Athlete Scholarship',o:'Sports Authority of India',when:'Athletes are picked from national events. Check the portal for dates',mode:'In person (SAI academies)',fee:'Free',minAge:14,maxAge:25,br:'any',link:'https://kheloindia.gov.in',d:'Top athletes can get about ₹6.28 lakh a year for training, coaching, kit, food and a monthly allowance.',tip:'You are picked through results at national games, Khelo India Youth Games or University Games. Keep your medals and certificates ready.',how:['Play and win medals at district, state, university or national events.','Open the Khelo India website and read the athlete scholarship page.','Your name is picked from the winners list by SAI and the sports federations.','Fill your athlete profile and bank details if the portal asks.','Join the assigned academy and keep your attendance and fitness tests up.']},
{id:'playo',t:'sports',e:'🏸',n:'Playo: find games near you',o:'Playo',when:'Every day. Search by sport and city',mode:'In person',fee:'Pay per game (varies)',br:'any',link:'https://playo.co',d:'Join local games of badminton, football, cricket, tennis and more. Good for practice and new friends.',tip:'Check the venue price and rating before you book. Go with a friend the first time.',how:['Install the app or open the website and set your city.','Pick a sport and a time that suits you.','Join an open game or book a court.','Reach 10 minutes early and carry water and sports shoes.']},
{id:'hudle',t:'sports',e:'⚽',n:'Hudle: book courts and turfs',o:'Hudle',when:'Every day',mode:'In person',fee:'Pay per slot (varies)',br:'any',link:'https://hudle.in',d:'Book sports courts, turfs and academies near you and find players to join your game.',tip:'Share the slot cost with your team to keep it cheap. Weekday mornings are usually cheaper.',how:['Open the website or app and choose your city.','Search the sport and compare venues by price and rating.','Book a slot and invite your friends.','Pay the share and show the booking at the venue.']},
{id:'fitindia',t:'sports',e:'💪',n:'Fit India Movement',o:'Government of India',when:'Rolling. Challenges and quizzes through the year',mode:'Online and in person',fee:'Free',br:'any',link:'https://fitindia.gov.in',d:'National fitness campaign with challenges, quizzes and events open to students.',tip:'Register yourself on the portal and join an active challenge.',how:['Open the Fit India website.','Register with your name and mobile or email.','Choose a challenge or event and follow the rules.','Share your progress to earn recognition.']}
);

/* ---------- govt jobs ---------- */
const JOB_NOTE='Age is counted on a cut-off date in the official notice. Always read the latest notification before you apply.';
const JOBS=[
{id:'agniarmy',s:'job',cats:['army'],e:'🪖',n:'Agniveer: Indian Army',o:'Indian Army (Ministry of Defence)',roles:'General Duty (10th pass), Technical and Clerk (12th pass), Tradesmen',loc:['all'],pay:'About ₹30,000 to ₹40,000 per month',dur:'4 years of service',minAge:17,maxAge:21,link:'https://joinindianarmy.nic.in',how:['Register on the Join Indian Army website.','Apply online for your trade when the rally notice is out.','Pass the online Common Entrance Exam.','Clear the physical fitness and measurement tests, then the medical test.','Selected candidates join as Agniveer. Some are kept on after 4 years.'],note:'Age is about 17.5 to 21 years. Women can apply for Corps of Military Police posts. Height and chest standards apply. '+JOB_NOTE},
{id:'aginavy',s:'job',cats:['navy'],e:'⚓',n:'Agniveer: Indian Navy (SSR and MR)',o:'Indian Navy',roles:'SSR needs 12th with Maths and Physics. MR needs 10th pass',loc:['all'],pay:'About ₹30,000 to ₹40,000 per month',dur:'4 years of service',minAge:17,maxAge:21,link:'https://www.joinindiannavy.gov.in',how:['Open the Join Indian Navy website and create an account.','Apply for SSR or MR when the notice is out.','Appear in the written exam, then the physical test.','Clear the medical test and wait for the merit list.'],note:'Women can apply too. Age is about 17.5 to 21 years. '+JOB_NOTE},
{id:'agniiaf',s:'job',cats:['airforce'],e:'✈️',n:'Agniveervayu: Indian Air Force',o:'Indian Air Force',roles:'Science trades need 12th with Maths, Physics and English. Other trades have their own rules',loc:['all'],pay:'About ₹30,000 to ₹40,000 per month',dur:'4 years of service',minAge:17,maxAge:22,link:'https://agnipathvayu.cdac.in',how:['Open the Agniveervayu portal and register.','Fill the online form and pay the fee if asked.','Appear in the online test.','Clear the physical fitness test, adaptability test and medical test.'],note:'Women can apply too. Age is normally 17.5 to 21 years. The March 2026 notice allowed up to 22. '+JOB_NOTE},
{id:'nda',s:'job',cats:['army','navy','airforce'],e:'🎖️',n:'NDA: National Defence Academy',o:'UPSC (for Army, Navy and Air Force officers)',roles:'Officer training after 12th. Air Force and Navy wings need Physics and Maths',loc:['all'],pay:'Stipend in training, then officer pay',dur:'Permanent officer career',minAge:16,maxAge:19,edu:'12',link:'https://upsc.gov.in',how:['Watch the UPSC website for the NDA and NAC notice (twice a year).','Apply online on the UPSC portal.','Appear in the written exam (Maths and General Ability).','Clear the SSB interview and medical test.','Join the academy if you are in the final merit list.'],note:'Unmarried candidates only. Age is 16.5 to 19.5 years. Women can apply. '+JOB_NOTE},
{id:'cds',s:'job',cats:['army','navy','airforce'],e:'🧭',n:'CDS: Combined Defence Services',o:'UPSC (IMA, INA, AFA, OTA)',roles:'Officer entry after graduation',loc:['all'],pay:'Stipend in training, then officer pay',dur:'Permanent officer career',minAge:19,maxAge:25,edu:'grad',link:'https://upsc.gov.in',how:['Watch the UPSC website for the CDS notice (twice a year).','Apply online.','Appear in the written exam.','Clear the SSB interview and the medical test.','Join the training academy.'],note:'IMA 19 to 24, INA 19 to 22 (engineering degree), AFA 20 to 24, OTA 19 to 25. Women can apply for OTA. Unmarried only. Final-year students can apply for some entries. '+JOB_NOTE},
{id:'afcat',s:'job',cats:['airforce'],e:'🛩️',n:'AFCAT: Air Force Officer Entry',o:'Indian Air Force',roles:'Flying and Ground Duty (technical and non-technical)',loc:['all'],pay:'Officer pay after training',dur:'Permanent officer career',minAge:20,maxAge:26,edu:'grad',link:'https://afcat.cdac.in',how:['Open the AFCAT website and register (twice a year).','Fill the form and pay the fee.','Appear in the online AFCAT exam.','Clear the AFSB interview and the medical test.','Join the Air Force Academy.'],note:'Flying branch is 20 to 24 years and ground duty is 20 to 26 years. Women can apply. '+JOB_NOTE},
{id:'ssccgl',s:'job',cats:['civil'],e:'🧾',n:'Income Tax Inspector (SSC CGL)',o:'Staff Selection Commission',roles:'Inspector of Income Tax and other group B posts',loc:['all'],pay:'Pay Level 7 (about ₹44,900 and above)',dur:'Permanent',minAge:18,maxAge:30,edu:'grad',link:'https://ssc.gov.in',how:['Create your one-time registration on the SSC website.','Apply for CGL when the notice is out (once a year).','Appear in the Tier 1 and Tier 2 computer-based exams.','Go through document verification.','Choose your posts in order of preference after the result.'],note:'Any bachelor degree works. Age limit is 18 to 30 for this post. Relaxation for reserved categories. All-India posting. '+JOB_NOTE},
{id:'sscgd',s:'job',cats:['police'],e:'🛡️',n:'SSC GD Constable (CAPF)',o:'Staff Selection Commission',roles:'Constable in BSF, CRPF, CISF, ITBP, SSB and Assam Rifles',loc:['all'],pay:'Pay Level 3 (₹21,700 to ₹69,100)',dur:'Permanent',minAge:18,maxAge:23,link:'https://ssc.gov.in',how:['Create your one-time registration on the SSC website.','Apply when the GD Constable notice is out.','Appear in the computer-based exam.','Clear the physical efficiency and physical standard tests.','Pass the medical test and document check.'],note:'10th pass is enough. Age 18 to 23. Relaxation for reserved categories. '+JOB_NOTE},
{id:'delhipolice',s:'job',cats:['police'],e:'🚓',n:'Delhi Police Constable (Executive)',o:'Delhi Police via SSC',roles:'Constable (Executive), male and female',loc:['Delhi NCR'],pay:'Pay Level 3 (₹21,700 to ₹69,100)',dur:'Permanent',minAge:18,maxAge:25,edu:'12',link:'https://ssc.gov.in',how:['Create your one-time registration on the SSC website.','Apply when the Delhi Police notice is out.','Appear in the computer-based exam.','Clear the physical standard test and the endurance test.','Pass the medical test.'],note:'12th pass needed. Male candidates need a valid light motor vehicle driving licence before the physical tests. '+JOB_NOTE},
{id:'haryanapolice',s:'job',cats:['police'],e:'👮',n:'Haryana Police Constable',o:'Haryana Staff Selection Commission',roles:'Constable, male and female posts',loc:['Delhi NCR'],pay:'About ₹21,700 per month to start',dur:'Permanent',minAge:18,maxAge:25,link:'https://hssc.gov.in',how:['Register on the HSSC website with your details.','Apply when the constable notice is out.','Appear in the written exam.','Clear the physical measurement and physical standard tests.','Pass the medical test and document check.'],note:'Qualification and age change with each notice, so read the latest HSSC notice. Haryana domicile rules apply. '+JOB_NOTE},
{id:'capfac',s:'job',cats:['police'],e:'🏛️',n:'CAPF Assistant Commandant',o:'UPSC (BSF, CRPF, CISF, ITBP, SSB)',roles:'Group A officer in the central armed police forces',loc:['all'],pay:'Group A officer pay scale',dur:'Permanent',minAge:20,maxAge:25,edu:'grad',link:'https://upsc.gov.in',how:['Watch the UPSC website for the CAPF (AC) notice (once a year).','Apply online.','Appear in the written exam and essay paper.','Clear the physical standards and medical test.','Appear in the interview.'],note:'Women can apply for the posts as per the notice. '+JOB_NOTE},
{id:'upsccse',s:'job',cats:['civil'],e:'🇮🇳',n:'UPSC Civil Services (IAS, IPS, IRS)',o:'UPSC',roles:'IAS, IPS, IRS and other central services',loc:['all'],pay:'Pay as per service and level',dur:'Permanent',minAge:21,maxAge:32,edu:'grad',link:'https://upsc.gov.in',how:['Watch the UPSC website for the notice (once a year).','Apply online and pay the fee.','Appear in Prelims, then Mains.','Appear in the personality test (interview).','Choose your services as per your rank.'],note:'Six attempts for general category. Relaxation for reserved categories. Final-year students can sit Prelims, but you need your degree by the Mains form. '+JOB_NOTE}
];

/* ---------- language and entrance exams ---------- */
const EXAMS=[
{k:'IELTS',e:'🗣️',kind:'English test',use:'UK, Canada, Australia, Ireland and many USA and Germany programs',score:'About 6.5 overall for most universities. Top ones ask 7.0 or more',cost:'About ₹18,000 to ₹19,000',valid:'2 years',link:'https://www.ielts.org',tip:'UK visas may need "IELTS for UKVI". Check this before you book.'},
{k:'TOEFL iBT',e:'📝',kind:'English test',use:'USA mostly, also Canada and others',score:'About 80 to 100 for most universities',cost:'About ₹18,000',valid:'2 years',link:'https://www.ets.org/toefl',tip:'Entirely on a computer. Extra score reports cost more.'},
{k:'PTE Academic',e:'💻',kind:'English test',use:'Australia, UK, Canada, Ireland',score:'About 58 to 64 for most universities',cost:'About ₹18,000 to ₹19,000',valid:'2 years',link:'https://www.pearsonpte.com',tip:'Results usually come in a few days. Score sharing is free.'},
{k:'Duolingo English Test',e:'🦉',kind:'English test',use:'Many universities in USA, Canada and others (check each one)',score:'About 115 to 120 for many programs',cost:'About US$ 60 to 70. Check the site for the current price',valid:'2 years',link:'https://englishtest.duolingo.com',tip:'Cheapest option and taken at home. Not accepted everywhere, so check your university first.'},
{k:'GRE',e:'📐',kind:'Entrance test',use:'Masters in USA (many engineering and CS programs). Some programs have made it optional',score:'Depends on the program. Check the university page',cost:'About US$ 220 (around ₹19,000)',valid:'5 years',link:'https://www.ets.org/gre',tip:'Check if your program still needs it before you pay.'},
{k:'GMAT',e:'📊',kind:'Entrance test',use:'MBA and business masters abroad',score:'Depends on the school',cost:'About US$ 275',valid:'5 years',link:'https://www.mba.com/exams/gmat-exam',tip:'Many schools also accept the GRE.'},
{k:'German tests',e:'🇩🇪',kind:'Language test',use:'Germany: programs taught in German (TestDaF, DSH, Goethe)',score:'Usually level B2 or C1',cost:'Varies by level and centre',valid:'Check each test',link:'https://www.daad.de/en/study-and-research-in-germany/',tip:'English-taught programs need IELTS or TOEFL instead.'},
{k:'JLPT',e:'🇯🇵',kind:'Language test',use:'Japan: programs taught in Japanese',score:'Level N2 or N1 is common',cost:'Varies by level and centre',valid:'No expiry on the certificate',link:'https://www.jlpt.jp/e/',tip:'Held twice a year in July and December. Register early.'}
];
const LEVELS=[['Competent','6.5','79 to 93','58 to 64','115 to 120'],['Good','7.0','94 to 101','65 to 72','125 to 130'],['Advanced','7.5','102 to 109','73 to 82','135 to 140']];

/* ---------- budget (approximate) ---------- */
const BUD={
USA:{cur:'USD',rate:88,tu:[20000,60000],liv:[12000,20000],once:[200000,300000]},
UK:{cur:'GBP',rate:117,tu:[15000,38000],liv:[12000,15000],once:[250000,350000]},
Canada:{cur:'CAD',rate:63,tu:[15000,35000],liv:[20000,25000],once:[180000,280000]},
Germany:{cur:'EUR',rate:102,tu:[0,3000],liv:[11000,14000],once:[200000,300000]},
Australia:{cur:'AUD',rate:58,tu:[20000,45000],liv:[25000,32000],once:[250000,350000]},
Ireland:{cur:'EUR',rate:102,tu:[10000,25000],liv:[12000,15000],once:[200000,300000]},
Japan:{cur:'JPY',rate:0.59,tu:[535800,900000],liv:[1200000,1800000],once:[150000,250000]}
};
const PAYLESS=[
['Scholarships','Look at DAAD (Germany), Chevening (UK), Fulbright-Nehru (USA) and your university\'s own awards. Apply early.',[['DAAD India','https://www.daad.in'],['Chevening','https://www.chevening.org'],['Fulbright (USIEF)','https://www.usief.org.in'],['National Scholarship Portal','https://scholarships.gov.in']]],
['Assistantships','Many masters and PhD programs offer teaching or research assistant roles that cover fees and give a stipend.',[]],
['Education loan','Banks give loans for study abroad. Compare interest, collateral and repayment start before you choose.',[['Vidya Lakshmi portal','https://www.vidyalakshmi.co.in']]],
['Choose smart','Public universities, cities outside the big ones, and shared housing can cut your cost by a lot.',[]]
];

/* ---------- research and professors ---------- */
const RES_STEPS=['Pick 3 to 5 topics you really like. Be specific, for example "phishing detection with machine learning".','Search the topic on Google Scholar and note professors who published in the last 2 years.','Open the university department page and check "People" or "Faculty" for the official email.','Read the abstract and conclusion of one or two recent papers. Note one real idea or question.','Write a short email (under 150 words). Say who you are, what you read, and what you can do.','Attach your CV. Send from your college email. Follow up once after 7 to 10 days.','Also apply on the official portal. An email alone is not an application.'];
const RES_FIND=['Department page: Faculty or People list on the university site.','Paper PDF: the corresponding author email is on the first page.','Google Scholar profile: shows recent papers and the university.','Do not guess emails or buy email lists. Use only official pages.'];
const RES_TOOLS=[
['Google Scholar','Find papers and professors.','https://scholar.google.com'],
['Semantic Scholar','Search papers with short summaries.','https://www.semanticscholar.org'],
['arXiv','Free preprints in CS, maths and physics.','https://arxiv.org'],
['Shodhganga','Free Indian PhD and masters theses.','https://shodhganga.inflibnet.ac.in'],
['Unpaywall','Find a free legal copy of a paper.','https://unpaywall.org'],
['Connected Papers','See how papers link to each other.','https://www.connectedpapers.com'],
['Zotero','Free tool to save papers and make references.','https://www.zotero.org'],
['Overleaf','Write your thesis in LaTeX online.','https://www.overleaf.com'],
['Academic Phrasebank','Sentence patterns for academic writing.','https://www.phrasebank.manchester.ac.uk'],
['Purdue OWL','Writing and citation guides.','https://owl.purdue.edu']
];
const RES_PROGS=[
['Mitacs Globalink Research Internship','12 weeks in Canada, May to October, with funding. For Indian B.E and B.Tech students (about 70% marks). Calls open around June. Check if your college is eligible.','https://www.mitacs.ca'],
['DAAD India scholarships','Study and research scholarships for Germany.','https://www.daad.in'],
['IAS-INSA-NASI Summer Research Fellowship','Two-month summer projects with scientists across India. For B.E, B.Tech and BCA (2nd and 3rd year) or B.Sc (2nd year), with about 65% marks. Applications usually open in October to November, so check now.','https://www.ias.ac.in'],
['Chevening Scholarships','Fully funded masters in the UK.','https://www.chevening.org'],
['Fulbright-Nehru Fellowships','Masters and research in the USA.','https://www.usief.org.in']
];
const THESIS=['Title and abstract','Introduction: the problem and why it matters','Literature review: what others have done','Method: what you did, step by step','Results: what you found (tables and graphs)','Discussion: what it means and what is missing','Conclusion and future work','References (use Zotero)'];

/* ---------- videos ---------- */
const YT='https://www.youtube.com/results?search_query=';
const VIDEOS=[
{g:'Coding',e:'🎓',n:'CS50 (Harvard)',d:'Famous free CS lectures by Prof. David Malan.',link:'https://www.youtube.com/@cs50',type:'channel'},
{g:'Coding',e:'💻',n:'freeCodeCamp',d:'Long free courses on web, Python, data and more.',link:'https://www.youtube.com/@freecodecamp',type:'channel'},
{g:'Coding',e:'🧑‍💻',n:'Apna College',d:'Hindi coding and placement preparation.',link:'https://www.youtube.com/@ApnaCollegeOfficial',type:'channel'},
{g:'Coding',e:'🐍',n:'CodeWithHarry',d:'Hindi tutorials on Python, web and tools.',link:'https://www.youtube.com/@CodeWithHarry',type:'channel'},
{g:'Coding',e:'🧠',n:'take U forward',d:'DSA and interview preparation.',link:'https://www.youtube.com/@takeUforward',type:'channel'},
{g:'Core subjects',e:'📚',n:'Neso Academy',d:'Clear lectures on CS, electronics and engineering subjects.',link:'https://www.youtube.com/@nesoacademy',type:'channel'},
{g:'Core subjects',e:'🧮',n:'Gate Smashers',d:'Hindi lectures on DBMS, OS, networks and more.',link:'https://www.youtube.com/@GateSmashers',type:'channel'},
{g:'Core subjects',e:'🇮🇳',n:'NPTEL (IIT professors)',d:'Full semester lectures from IIT and IISc professors.',link:YT+'NPTEL+lecture+playlist',type:'search'},
{g:'Professors',e:'🏛️',n:'MIT OpenCourseWare',d:'Full university lectures by MIT professors.',link:'https://www.youtube.com/@mitocw',type:'channel'},
{g:'Professors',e:'📐',n:'3Blue1Brown',d:'Visual maths explained by Grant Sanderson.',link:'https://www.youtube.com/@3blue1brown',type:'channel'},
{g:'Professors',e:'🎒',n:'Khan Academy',d:'Maths, science and economics from basics.',link:'https://www.youtube.com/@khanacademy',type:'channel'},
{g:'Cybersecurity',e:'🛡️',n:'Professor Messer',d:'Free CompTIA Security+ and network courses.',link:'https://www.youtube.com/@professormesser',type:'channel'},
{g:'Cybersecurity',e:'🌐',n:'NetworkChuck',d:'Networking and cybersecurity for beginners.',link:'https://www.youtube.com/@NetworkChuck',type:'channel'},
{g:'Cybersecurity',e:'🕵️',n:'John Hammond',d:'CTF walkthroughs and malware analysis.',link:'https://www.youtube.com/@_JohnHammond',type:'channel'},
{g:'Govt exams',e:'🪖',n:'Agniveer and NDA preparation',d:'Search for the latest preparation videos.',link:YT+'Agniveer+NDA+preparation',type:'search'},
{g:'Govt exams',e:'🧾',n:'SSC CGL and SSC GD preparation',d:'Search for strategy and practice videos.',link:YT+'SSC+CGL+SSC+GD+preparation+strategy',type:'search'},
{g:'Govt exams',e:'🇮🇳',n:'UPSC civil services strategy',d:'Search for beginner strategy and syllabus videos.',link:YT+'UPSC+CSE+strategy+for+beginners',type:'search'},
{g:'Abroad and research',e:'🎓',n:'Andy Stapleton',d:'PhD and research advice, academic writing and tools for students.',link:'https://www.youtube.com/@DrAndyStapleton',type:'channel'},
{g:'Abroad and research',e:'🗣️',n:'IELTS and TOEFL preparation',d:'Search for free speaking and writing tips.',link:YT+'IELTS+TOEFL+preparation+tips',type:'search'},
{g:'Abroad and research',e:'✉️',n:'How to email a professor',d:'Search for tips on writing to professors for research.',link:YT+'how+to+email+a+professor+for+research+position',type:'search'},
{g:'Abroad and research',e:'🔬',n:'How to read and write a research paper',d:'Search for beginner guides.',link:YT+'how+to+read+a+research+paper',type:'search'}
];

/* ---------- talk to someone ---------- */
const HELP=[
{g:'Career guidance',items:[
{n:'National Career Service (NCS)',d:'Government portal for free career guidance, courses and job listings.',link:'https://www.ncs.gov.in'},
{n:'ADPList',d:'Free one-to-one mentoring with people working in tech, design and more.',link:'https://adplist.org'},
{n:'Your college placement or counselling cell',d:'Ask your department for the career counsellor or placement officer.'}]},
{g:'Feeling stressed or low',items:[
{n:'Tele-MANAS',d:'Free mental health support from trained counsellors, in many languages.',tel:'14416',show:'14416 or 1800-891-4416'},
{n:'KIRAN',d:'Government mental health helpline. 24 hours, 7 days.',tel:'18005990019',show:'1800-599-0019'},
{n:'Vandrevala Foundation',d:'Free counselling over phone. 24 hours, 7 days.',tel:'+919999666555',show:'+91 9999 666 555'},
{n:'iCall (TISS)',d:'Counselling by trained professionals. Monday to Saturday, 10 am to 8 pm.',tel:'9152987821',show:'9152987821'},
{n:'Mann Talks',d:'Counselling support. 9 am to 8 pm, every day.',tel:'8686139139',show:'8686 139139'},
{n:'Emergency (police, fire, ambulance)',d:'If you or someone near you is in danger right now.',tel:'112',show:'112'}]},
{g:'Study abroad advice',items:[
{n:'EducationUSA India',d:'Free official advising on studying in the USA.',link:'https://educationusa.state.gov'},
{n:'British Council India',d:'Official information on studying in the UK.',link:'https://www.britishcouncil.in'},
{n:'DAAD India',d:'Official information and scholarships for Germany.',link:'https://www.daad.in'},
{n:'Be careful with agents',d:'Official advising is free. Do not pay large fees upfront, and never share your passport photo or OTP with strangers.'}]},
{g:'Safety and rights',items:[
{n:'Anti-Ragging Helpline',d:'Report ragging in your college.',tel:'18001805522',show:'1800-180-5522'},
{n:'Women Helpline',d:'Support for women facing violence or harassment.',tel:'181',show:'181'},
{n:'Cyber Crime Helpline',d:'Report online fraud, scams and cyber harassment. Also report at cybercrime.gov.in.',tel:'1930',show:'1930'}]}
];


/* ---------- closing dates (YYYY-MM-DD). DEMO VALUES: replace with the real date from each official notice ---------- */
const DEADLINES={};

/* ---------- Hindi text for Govt jobs: [name, one line] ---------- */
const JOB_HI={
agniarmy:['अग्निवीर: भारतीय सेना','10वीं/12वीं पास युवाओं के लिए 4 साल की सेना सेवा।'],
aginavy:['अग्निवीर: भारतीय नौसेना (SSR और MR)','SSR के लिए 12वीं (गणित, भौतिकी), MR के लिए 10वीं पास।'],
agniiaf:['अग्निवीरवायु: भारतीय वायुसेना','12वीं पास युवाओं के लिए वायुसेना में 4 साल की सेवा।'],
nda:['NDA: राष्ट्रीय रक्षा अकादमी','12वीं के बाद सेना, नौसेना, वायुसेना में अफ़सर बनने की परीक्षा।'],
cds:['CDS: संयुक्त रक्षा सेवा परीक्षा','ग्रेजुएशन के बाद अफ़सर अकादमी में प्रवेश।'],
afcat:['AFCAT: वायुसेना अफ़सर परीक्षा','ग्रेजुएट युवाओं के लिए वायुसेना में अफ़सर भर्ती।'],
ssccgl:['SSC CGL','ग्रेजुएट के लिए केंद्र सरकार के कई विभागों में भर्ती।'],
sscgd:['SSC GD कॉन्स्टेबल','10वीं पास के लिए केंद्रीय बलों में कॉन्स्टेबल भर्ती।'],
delhipolice:['दिल्ली पुलिस भर्ती','दिल्ली पुलिस में कॉन्स्टेबल और अन्य पद।'],
haryanapolice:['हरियाणा पुलिस भर्ती','हरियाणा पुलिस में कॉन्स्टेबल और अन्य पद।'],
capfac:['CAPF (AC) परीक्षा','केंद्रीय सशस्त्र पुलिस बलों में असिस्टेंट कमांडेंट।'],
upsccse:['UPSC सिविल सेवा','IAS, IPS और अन्य सेवाओं के लिए देश की सबसे बड़ी परीक्षा।']};
const HI={
h1:'अपने लिए सही मौके खोजें',hey:'नमस्ते, ',sub:'अपनी प्रोफ़ाइल डालें। सिर्फ़ वही देखें जिसके लिए आप अप्लाई कर सकते हैं।',
tiles:{'Hackathons':'हैकाथॉन','Internships':'इंटर्नशिप','Govt jobs':'सरकारी नौकरी','Sports':'खेल','Abroad':'विदेश','Research':'रिसर्च','Talk':'बात करें','Ask Buddy':'Buddy से पूछें'},
heroOk:(x,n)=>'अभी '+n+' में से '+x+' मौकों के लिए आप अप्लाई कर सकते हैं',see:'देखें',
hero30:'30 सेकंड',hero30p:'अपना साल और ब्रांच बताइए। हम सिर्फ़ वही दिखाएंगे जिसके लिए आप योग्य हैं।',check:'पात्रता जाँचें',
picked:'आपके लिए चुने हुए',trend:'ट्रेंडिंग',how:'अप्लाई कैसे करें',why:'कारण: ',
q:'सेट अप करें',ok:'✓ आप अप्लाई कर सकते हैं',no:'योग्य नहीं',soon:'जल्द बंद',days:'दिन',today:'आज बंद',
only:'सिर्फ़ वही जिनके लिए मैं अप्लाई कर सकता/सकती हूँ',jc:{all:'सभी',army:'सेना',navy:'नौसेना',airforce:'वायुसेना',police:'पुलिस',civil:'टैक्स और सिविल'},
read:'पहले यह पढ़ें',note:'यहाँ दी गई उम्र, फ़ीस और तारीख़ें हर साल बदलती हैं। अप्लाई करने से पहले आधिकारिक वेबसाइट ज़रूर देखें।',
setup:'अपने लिए देखना चाहते हैं?',setupb:'सेट अप'};
