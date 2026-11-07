// Complete 253 Institutions Builder
const fs = require('fs');
const path = require('path');

const institutes = [
  // 1. IITs (23)
  { id: "iit-kgp", name: "IIT Kharagpur", shortName: "IIT KGP", category: "IIT", subCategory: "Indian Institutes of Technology", address: "Kharagpur, Paschim Medinipur District – 721302", city: "Kharagpur", state: "West Bengal", website: "https://www.iitkgp.ac.in", recruitmentUrl: "https://www.iitkgp.ac.in/temporary-jobs", phdUrl: "https://gateoffice.iitkgp.ac.in/phd/", sricUrl: "http://www.sric.iitkgp.ac.in", researchFocus: "Engineering, Computing, AI, Materials, Nanotech, Biotechnology" },
  { id: "iit-bombay", name: "IIT Bombay", shortName: "IITB", category: "IIT", subCategory: "Indian Institutes of Technology", address: "Main Gate Road, Powai, Mumbai – 400076", city: "Mumbai", state: "Maharashtra", website: "https://www.iitb.ac.in", recruitmentUrl: "https://www.iitb.ac.in/en/careers/staff-recruitment", phdUrl: "https://www.iitb.ac.in/newacadhome/phd.jsp", sricUrl: "https://www.ircc.iitb.ac.in", researchFocus: "Aerospace, Chemical, CS, Electrical, Energy Science, Biomedical" },
  { id: "iit-madras", name: "IIT Madras", shortName: "IITM", category: "IIT", subCategory: "Indian Institutes of Technology", address: "Sardar Patel Road, Adyar, Chennai – 600036", city: "Chennai", state: "Tamil Nadu", website: "https://www.iitm.ac.in", recruitmentUrl: "https://www.iitm.ac.in/careers", phdUrl: "https://research.iitm.ac.in", sricUrl: "https://icandsr.iitm.ac.in", researchFocus: "Quantum Computing, Data Science, Ocean Engg, Deep Tech" },
  { id: "iit-kanpur", name: "IIT Kanpur", shortName: "IITK", category: "IIT", subCategory: "Indian Institutes of Technology", address: "Kalyanpur, Kanpur – 208016", city: "Kanpur", state: "Uttar Pradesh", website: "https://www.iitk.ac.in", recruitmentUrl: "https://www.iitk.ac.in/dord/project-vacancies", phdUrl: "https://www.iitk.ac.in/doaa/pgadmission", sricUrl: "https://www.iitk.ac.in/dord", researchFocus: "Cybersecurity, Materials Science, Aerospace, Clean Energy" },
  { id: "iit-delhi", name: "IIT Delhi", shortName: "IITD", category: "IIT", subCategory: "Indian Institutes of Technology", address: "Hauz Khas, New Delhi – 110016", city: "New Delhi", state: "Delhi", website: "https://home.iitd.ac.in", recruitmentUrl: "https://ird.iitd.ac.in/vacancies", phdUrl: "https://home.iitd.ac.in/pg-admissions.php", sricUrl: "https://ird.iitd.ac.in", researchFocus: "AI/ML, Optics & Photonics, Clean Energy, Biomedical" },
  { id: "iit-guwahati", name: "IIT Guwahati", shortName: "IITG", category: "IIT", subCategory: "Indian Institutes of Technology", address: "North Guwahati, Amingaon, Guwahati – 781039", city: "Guwahati", state: "Assam", website: "https://www.iitg.ac.in", recruitmentUrl: "https://www.iitg.ac.in/rnd/recruitment", phdUrl: "https://www.iitg.ac.in/acad/admission/", sricUrl: "https://www.iitg.ac.in/rnd", researchFocus: "Disaster Management, Nanotechnology, Bio-Sciences, Robotics" },
  { id: "iit-roorkee", name: "IIT Roorkee", shortName: "IITR", category: "IIT", subCategory: "Indian Institutes of Technology", address: "Roorkee, Haridwar District – 247667", city: "Roorkee", state: "Uttarakhand", website: "https://www.iitr.ac.in", recruitmentUrl: "https://iitr.ac.in/careers", phdUrl: "https://iitr.ac.in/admissions/pages/Phd.html", sricUrl: "https://sric.iitr.ac.in", researchFocus: "Earth Sciences, Water Resources, Earthquake Engineering, Metallurgy" },
  { id: "iit-bhu", name: "IIT (BHU) Varanasi", shortName: "IIT BHU", category: "IIT", subCategory: "Indian Institutes of Technology", address: "Banaras Hindu University Campus, Varanasi – 221005", city: "Varanasi", state: "Uttar Pradesh", website: "https://www.iitbhu.ac.in", recruitmentUrl: "https://www.iitbhu.ac.in/positions_available", phdUrl: "https://pgadmission.iitbhu.ac.in", sricUrl: "https://www.iitbhu.ac.in/rnd", researchFocus: "Ceramics, Pharmaceutics, Mining, Metallurgy, Computing" },
  { id: "iit-ism-dhanbad", name: "IIT (ISM) Dhanbad", shortName: "IIT ISM", category: "IIT", subCategory: "Indian Institutes of Technology", address: "Police Line Road, Hirapur, Dhanbad – 826004", city: "Dhanbad", state: "Jharkhand", website: "https://www.iitism.ac.in", recruitmentUrl: "https://www.iitism.ac.in/index.php/links/project_vacancy", phdUrl: "https://admission.iitism.ac.in/index.php/admission/phd", sricUrl: "https://www.iitism.ac.in/sric", researchFocus: "Mineral Engineering, Petroleum Technology, Applied Geology" },
  { id: "iit-ropar", name: "IIT Ropar", shortName: "IIT Ropar", category: "IIT", subCategory: "Indian Institutes of Technology", address: "Bara Phool, Nangal Road, Rupnagar – 140001", city: "Rupnagar", state: "Punjab", website: "https://www.iitrpr.ac.in", recruitmentUrl: "https://www.iitrpr.ac.in/staff-positions", phdUrl: "https://www.iitrpr.ac.in/phd-admissions", sricUrl: "https://www.iitrpr.ac.in/rnd", researchFocus: "Agriculture Tech, Bio-Medical, Water, AI" },
  { id: "iit-bhubaneswar", name: "IIT Bhubaneswar", shortName: "IIT BBS", category: "IIT", subCategory: "Indian Institutes of Technology", address: "Argul, Jatni, Khordha District – 752050", city: "Bhubaneswar", state: "Odisha", website: "https://www.iitbbs.ac.in", recruitmentUrl: "https://www.iitbbs.ac.in/jobs-iitbbs.php", phdUrl: "https://www.iitbbs.ac.in/phd-application/", sricUrl: "https://www.iitbbs.ac.in/sric", researchFocus: "Climate Sciences, Infrastructure, Minerals, Microelectronics" },
  { id: "iit-gandhinagar", name: "IIT Gandhinagar", shortName: "IITGN", category: "IIT", subCategory: "Indian Institutes of Technology", address: "Palaj, Gandhinagar – 382355", city: "Gandhinagar", state: "Gujarat", website: "https://www.iitgn.ac.in", recruitmentUrl: "https://www.iitgn.ac.in/careers/staff", phdUrl: "https://www.iitgn.ac.in/admissions/phd", sricUrl: "https://www.iitgn.ac.in/research", researchFocus: "Cognitive Science, Earth Sciences, Archaeological Sciences" },
  { id: "iit-hyderabad", name: "IIT Hyderabad", shortName: "IITH", category: "IIT", subCategory: "Indian Institutes of Technology", address: "Kandi, Sangareddy District – 502284", city: "Hyderabad", state: "Telangana", website: "https://www.iith.ac.in", recruitmentUrl: "https://www.iith.ac.in/careers/", phdUrl: "https://www.iith.ac.in/phdadmissions/", sricUrl: "https://sric.iith.ac.in", researchFocus: "AI, 5G/6G, Additive Manufacturing, Nanotech, Healthcare" },
  { id: "iit-jodhpur", name: "IIT Jodhpur", shortName: "IITJ", category: "IIT", subCategory: "Indian Institutes of Technology", address: "NH-62, Nagaur Road, Karwar, Jodhpur – 342030", city: "Jodhpur", state: "Rajasthan", website: "https://www.iitj.ac.in", recruitmentUrl: "https://www.iitj.ac.in/staff_recruitment", phdUrl: "https://oa.iitj.ac.in/admission/", sricUrl: "https://www.iitj.ac.in/research", researchFocus: "Solar Energy, Desert Studies, AIoT, Cyber-Physical Systems" },
  { id: "iit-patna", name: "IIT Patna", shortName: "IITP", category: "IIT", subCategory: "Indian Institutes of Technology", address: "Bihta, Patna District – 801106", city: "Patna", state: "Bihar", website: "https://www.iitp.ac.in", recruitmentUrl: "https://www.iitp.ac.in/index.php/en-us/notice-board/staff-recruitment", phdUrl: "https://www.iitp.ac.in/academic/admission.php", sricUrl: "https://www.iitp.ac.in/rnd", researchFocus: "NLP, VLSI, Advanced Materials, Thermal Engineering" },
  { id: "iit-indore", name: "IIT Indore", shortName: "IITI", category: "IIT", subCategory: "Indian Institutes of Technology", address: "Khandwa Road, Simrol, Indore – 453552", city: "Indore", state: "Madhya Pradesh", website: "https://www.iiti.ac.in", recruitmentUrl: "https://www.iiti.ac.in/careers", phdUrl: "https://academic.iiti.ac.in/phd.php", sricUrl: "https://rnd.iiti.ac.in", researchFocus: "Space Science, Astronomy, Optoelectronics, Biosensors" },
  { id: "iit-mandi", name: "IIT Mandi", shortName: "IIT Mandi", category: "IIT", subCategory: "Indian Institutes of Technology", address: "Kamand, Mandi District – 175075", city: "Mandi", state: "Himachal Pradesh", website: "https://www.iitmandi.ac.in", recruitmentUrl: "https://www.iitmandi.ac.in/administration/recruitment.php", phdUrl: "https://www.iitmandi.ac.in/admissions.php", sricUrl: "https://www.iitmandi.ac.in/research", researchFocus: "Himalayan Ecology, Nanotech, Indian Knowledge Systems" },
  { id: "iit-palakkad", name: "IIT Palakkad", shortName: "IITPKD", category: "IIT", subCategory: "Indian Institutes of Technology", address: "Kanjikode, Palakkad – 678623", city: "Palakkad", state: "Kerala", website: "https://iitpkd.ac.in", recruitmentUrl: "https://iitpkd.ac.in/recruitment", phdUrl: "https://resurs.iitpkd.ac.in", sricUrl: "https://icandsr.iitpkd.ac.in", researchFocus: "Sensors, Sustainable Materials, Cloud Computing" },
  { id: "iit-tirupati", name: "IIT Tirupati", shortName: "IITTP", category: "IIT", subCategory: "Indian Institutes of Technology", address: "Yerpedu–Venkatagiri Road, Yerpedu Post, Tirupati District – 517619", city: "Tirupati", state: "Andhra Pradesh", website: "https://iittp.ac.in", recruitmentUrl: "https://iittp.ac.in/recruitment", phdUrl: "https://iittp.ac.in/phd-admissions", sricUrl: "https://iittp.ac.in/research", researchFocus: "Smart Infrastructure, Water Quality, Semiconductors" },
  { id: "iit-bhilai", name: "IIT Bhilai", shortName: "IIT Bhilai", category: "IIT", subCategory: "Indian Institutes of Technology", address: "Kutelabhata, Khapri, Durg District – 491001", city: "Durg (Bhilai)", state: "Chhattisgarh", website: "https://www.iitbhilai.ac.in", recruitmentUrl: "https://www.iitbhilai.ac.in/index.php?pid=recruitment", phdUrl: "https://www.iitbhilai.ac.in/index.php?pid=phd_admission", sricUrl: "https://www.iitbhilai.ac.in/index.php?pid=rnd", researchFocus: "FinTech, Data Science, Materials, Bio-Engineering" },
  { id: "iit-goa", name: "IIT Goa", shortName: "IIT Goa", category: "IIT", subCategory: "Indian Institutes of Technology", address: "GEC Campus, Farmagudi, Ponda – 403401", city: "Ponda", state: "Goa", website: "https://iitgoa.ac.in", recruitmentUrl: "https://iitgoa.ac.in/career", phdUrl: "https://iitgoa.ac.in/phd-admissions", sricUrl: "https://iitgoa.ac.in/rnd", researchFocus: "Ocean Tech, Robotics, Renewable Energy" },
  { id: "iit-jammu", name: "IIT Jammu", shortName: "IIT Jammu", category: "IIT", subCategory: "Indian Institutes of Technology", address: "NH-44, Jagti, PO Nagrota, Jammu – 181221", city: "Jammu", state: "Jammu & Kashmir", website: "https://iitjammu.ac.in", recruitmentUrl: "https://iitjammu.ac.in/staff-recruitment", phdUrl: "https://eg.iitjammu.ac.in/phdapplication", sricUrl: "https://iitjammu.ac.in/research", researchFocus: "Security Systems, High Altitude Tech, Infrastructure" },
  { id: "iit-dharwad", name: "IIT Dharwad", shortName: "IIT Dharwad", category: "IIT", subCategory: "Indian Institutes of Technology", address: "Chikkamalligawad, Dharwad – 580007", city: "Dharwad", state: "Karnataka", website: "https://www.iitdh.ac.in", recruitmentUrl: "https://www.iitdh.ac.in/announcements", phdUrl: "https://www.iitdh.ac.in/phd", sricUrl: "https://www.iitdh.ac.in/rnd", researchFocus: "Embedded Systems, Quantum Computing, Space Tech" },

  // 2. IISc, IISERs and NISER (9)
  { id: "iisc-bangalore", name: "Indian Institute of Science (IISc)", shortName: "IISc", category: "IISc / IISER", subCategory: "IISc, IISERs and NISER", address: "C.V. Raman Road, Bengaluru – 560012", city: "Bengaluru", state: "Karnataka", website: "https://iisc.ac.in", recruitmentUrl: "https://iisc.ac.in/positions-open/", phdUrl: "https://admissions.iisc.ac.in", sricUrl: "https://ird.iisc.ac.in", researchFocus: "Apex science & engineering, fundamental & applied research" },
  { id: "iiser-pune", name: "IISER Pune", shortName: "IISER Pune", category: "IISc / IISER", subCategory: "IISc, IISERs and NISER", address: "Dr. Homi Bhabha Road, Pashan, Pune – 411008", city: "Pune", state: "Maharashtra", website: "https://www.iiserpune.ac.in", recruitmentUrl: "https://www.iiserpune.ac.in/opportunities/openings", phdUrl: "https://www.iiserpune.ac.in/admissions/phd-programme", sricUrl: "https://www.iiserpune.ac.in/research", researchFocus: "Physical, Chemical, Biological and Earth Sciences" },
  { id: "iiser-kolkata", name: "IISER Kolkata", shortName: "IISER K", category: "IISc / IISER", subCategory: "IISc, IISERs and NISER", address: "Mohanpur, Nadia District – 741246", city: "Mohanpur (Kalyani)", state: "West Bengal", website: "https://www.iiserkol.ac.in", recruitmentUrl: "https://www.iiserkol.ac.in/web/en/job-vacancies/", phdUrl: "https://apply.iiserkol.ac.in/phd/", sricUrl: "https://www.iiserkol.ac.in/research", researchFocus: "Space Physics, Chemical Biology, Nonlinear Dynamics" },
  { id: "iiser-mohali", name: "IISER Mohali", shortName: "IISER M", category: "IISc / IISER", subCategory: "IISc, IISERs and NISER", address: "Knowledge City, Sector 81, SAS Nagar, Manauli PO – 140306", city: "Mohali", state: "Punjab", website: "https://www.iisermohali.ac.in", recruitmentUrl: "https://www.iisermohali.ac.in/positions-open", phdUrl: "https://www.iisermohali.ac.in/phd-admissions", sricUrl: "https://www.iisermohali.ac.in/research", researchFocus: "Biological Sciences, Chemical Sciences, Math, Physics" },
  { id: "iiser-bhopal", name: "IISER Bhopal", shortName: "IISER B", category: "IISc / IISER", subCategory: "IISc, IISERs and NISER", address: "Bhopal Bypass Road, Bhauri, Bhopal – 462066", city: "Bhopal", state: "Madhya Pradesh", website: "https://www.iiserb.ac.in", recruitmentUrl: "https://www.iiserb.ac.in/staffvacancies", phdUrl: "https://www.iiserb.ac.in/doaa/phd-admission", sricUrl: "https://www.iiserb.ac.in/research", researchFocus: "Data Science, Chemical Engineering, Earth & Env Sciences" },
  { id: "iiser-tvm", name: "IISER Thiruvananthapuram", shortName: "IISER TVM", category: "IISc / IISER", subCategory: "IISc, IISERs and NISER", address: "Maruthamala PO, Vithura, Thiruvananthapuram – 695551", city: "Thiruvananthapuram", state: "Kerala", website: "https://www.iisertvm.ac.in", recruitmentUrl: "https://www.iisertvm.ac.in/pages/job_opportunities", phdUrl: "https://www.iisertvm.ac.in/pages/phd_admissions", sricUrl: "https://www.iisertvm.ac.in/pages/research", researchFocus: "Fundamental Sciences, Biomolecular Structure, Condensed Matter" },
  { id: "iiser-tirupati", name: "IISER Tirupati", shortName: "IISER TPT", category: "IISc / IISER", subCategory: "IISc, IISERs and NISER", address: "Srinivasapuram, Jangalapalli Village, Yerpedu Mandal, Tirupati – 517619", city: "Tirupati", state: "Andhra Pradesh", website: "https://www.iisertirupati.ac.in", recruitmentUrl: "https://www.iisertirupati.ac.in/job-opportunities/", phdUrl: "https://www.iisertirupati.ac.in/admissions/phd/", sricUrl: "https://www.iisertirupati.ac.in/research/", researchFocus: "Biophysics, Chemical Biology, Ecology, Quantum Materials" },
  { id: "iiser-berhampur", name: "IISER Berhampur", shortName: "IISER BPR", category: "IISc / IISER", subCategory: "IISc, IISERs and NISER", address: "Laudigam, Konisi, Berhampur, Ganjam District – 760003", city: "Berhampur", state: "Odisha", website: "https://www.iiserbpr.ac.in", recruitmentUrl: "https://www.iiserbpr.ac.in/vacancies", phdUrl: "https://www.iiserbpr.ac.in/phd-admissions", sricUrl: "https://www.iiserbpr.ac.in/research", researchFocus: "Basic sciences, Computational Biology, Laser Spectroscopy" },
  { id: "niser-bhubaneswar", name: "NISER Bhubaneswar", shortName: "NISER", category: "IISc / IISER", subCategory: "IISc, IISERs and NISER", address: "PO Bhimpur-Padanpur, Via Jatni, Khordha District – 752050", city: "Bhubaneswar (Jatni)", state: "Odisha", website: "https://www.niser.ac.in", recruitmentUrl: "https://www.niser.ac.in/notices/recruitment", phdUrl: "https://www.niser.ac.in/phd-admission", sricUrl: "https://www.niser.ac.in/research", researchFocus: "DAE affiliated, Nuclear sciences, High energy physics, Biology" }
];

// Helper to push with clean ID
function addInst(category, subCategory, name, shortName, city, state, address, website, recUrl, phdUrl, focus) {
  const id = (shortName || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  institutes.push({
    id: `${category.toLowerCase()}-${id}`,
    name,
    shortName: shortName || name,
    category,
    subCategory,
    address,
    city,
    state,
    website: website || 'https://www.india.gov.in',
    recruitmentUrl: recUrl || website || 'https://www.india.gov.in',
    phdUrl: phdUrl || website || 'https://www.india.gov.in',
    sricUrl: website || 'https://www.india.gov.in',
    researchFocus: focus || 'Scientific research and academic development'
  });
}

// 3. NITs (31)
const nitData = [
  ["NIT Agartala", "NIT Agartala", "Agartala", "Tripura", "Barjala, Jirania, West Tripura – 799046", "https://www.nita.ac.in", "https://www.nita.ac.in/recruitment.aspx", "https://www.nita.ac.in/phd.aspx"],
  ["MNNIT Allahabad", "MNNIT Allahabad", "Prayagraj", "Uttar Pradesh", "Teliarganj, Prayagraj – 211004", "https://www.mnnit.ac.in", "https://www.mnnit.ac.in/index.php/jobs-at-mnnit", "https://academics.mnnit.ac.in/phd/"],
  ["NIT Andhra Pradesh", "NIT AP", "Tadepalligudem", "Andhra Pradesh", "Kadakatla, Tadepalligudem, West Godavari District – 534101", "https://www.nitandhra.ac.in", "https://www.nitandhra.ac.in/main/recruitment", "https://www.nitandhra.ac.in/main/admissions"],
  ["NIT Arunachal Pradesh", "NIT AP (Jote)", "Jote", "Arunachal Pradesh", "Jote, Papum Pare District – 791113", "https://www.nitap.ac.in", "https://www.nitap.ac.in/recruitment", "https://www.nitap.ac.in/admissions/phd"],
  ["MANIT Bhopal", "MANIT Bhopal", "Bhopal", "Madhya Pradesh", "Link Road No. 3, Near Kali Mata Mandir, Bhopal – 462003", "https://www.manit.ac.in", "https://www.manit.ac.in/careers", "https://www.manit.ac.in/admissions"],
  ["NIT Calicut", "NIT Calicut", "Kozhikode", "Kerala", "NIT Campus PO, Kozhikode – 673601", "https://nitc.ac.in", "https://nitc.ac.in/careers", "https://nitc.ac.in/admissions/phd"],
  ["NIT Delhi", "NIT Delhi", "New Delhi", "Delhi", "Plot No. FA7, Zone P1, GT Karnal Road, Narela, Delhi – 110036", "https://nitdelhi.ac.in", "https://nitdelhi.ac.in/recruitment", "https://nitdelhi.ac.in/admissions/phd-admissions"],
  ["NIT Durgapur", "NIT Durgapur", "Durgapur", "West Bengal", "Mahatma Gandhi Avenue, Durgapur – 713209", "https://nitdgp.ac.in", "https://nitdgp.ac.in/careers.php", "https://nitdgp.ac.in/p/phd-admissions"],
  ["NIT Goa", "NIT Goa", "Cuncolim", "Goa", "Cuncolim, Salcete, South Goa – 403703", "https://nitgoa.ac.in", "https://nitgoa.ac.in/recruitment", "https://nitgoa.ac.in/phd_admission"],
  ["NIT Hamirpur", "NIT Hamirpur", "Hamirpur", "Himachal Pradesh", "Anu, Hamirpur – 177005", "https://nith.ac.in", "https://nith.ac.in/advertisement-recruitment", "https://nith.ac.in/ph-d-programmes"],
  ["MNIT Jaipur", "MNIT Jaipur", "Jaipur", "Rajasthan", "J.L.N. Marg, Malviya Nagar, Jaipur – 302017", "https://www.mnit.ac.in", "https://www.mnit.ac.in/cms/index.php?page=recruitment", "https://www.mnit.ac.in/academics/admission.php"],
  ["Dr. B.R. Ambedkar NIT Jalandhar", "NIT Jalandhar", "Jalandhar", "Punjab", "G.T. Road, Amritsar Bye-Pass, Jalandhar – 144008", "https://www.nitj.ac.in", "https://www.nitj.ac.in/index.php/nitj_cinfo/jobs", "https://www.nitj.ac.in/index.php/nitj_cinfo/index/65"],
  ["NIT Jamshedpur", "NIT Jamshedpur", "Jamshedpur", "Jharkhand", "Adityapur, Jamshedpur – 831014", "https://nitjsr.ac.in", "https://nitjsr.ac.in/notices/recruitment", "https://nitjsr.ac.in/academic/admissions/PhD"],
  ["NIT Kurukshetra", "NIT Kurukshetra", "Kurukshetra", "Haryana", "Thanesar, Kurukshetra – 136119", "https://nitkkr.ac.in", "https://nitkkr.ac.in/careers", "https://nitkkr.ac.in/phd-admissions"],
  ["NIT Manipur", "NIT Manipur", "Imphal", "Manipur", "Langol, Imphal West – 795004", "https://www.nitmanipur.ac.in", "https://www.nitmanipur.ac.in/recruitment.aspx", "https://www.nitmanipur.ac.in/admissions.aspx"],
  ["NIT Meghalaya", "NIT Meghalaya", "Sohra / Shillong", "Meghalaya", "Sohra (Cherrapunjee), East Khasi Hills – 793108", "https://www.nitm.ac.in", "https://www.nitm.ac.in/recruitment", "https://www.nitm.ac.in/phd-admissions"],
  ["NIT Mizoram", "NIT Mizoram", "Aizawl", "Mizoram", "Chaltlang, Aizawl – 796012", "https://www.nitmz.ac.in", "https://www.nitmz.ac.in/Recruitment_Notices.aspx", "https://www.nitmz.ac.in/Phd_Admission.aspx"],
  ["NIT Nagaland", "NIT Nagaland", "Dimapur", "Nagaland", "Chumukedima, Dimapur – 797103", "https://nitnagaland.ac.in", "https://nitnagaland.ac.in/recruitment", "https://nitnagaland.ac.in/admissions/phd"],
  ["NIT Patna", "NIT Patna", "Patna", "Bihar", "Ashok Rajpath, Mahendru, Patna – 800005", "https://www.nitp.ac.in", "https://www.nitp.ac.in/recruitment", "https://www.nitp.ac.in/academic/phd_admission"],
  ["NIT Puducherry", "NIT Puducherry", "Karaikal", "Puducherry", "Thiruvettakudy, Karaikal – 609609", "https://www.nitpy.ac.in", "https://www.nitpy.ac.in/recruitment", "https://www.nitpy.ac.in/academics/phd"],
  ["NIT Raipur", "NIT Raipur", "Raipur", "Chhattisgarh", "G.E. Road, Raipur – 492010", "https://nitrr.ac.in", "https://nitrr.ac.in/careers.php", "https://nitrr.ac.in/phd_programme.php"],
  ["NIT Rourkela", "NIT Rourkela", "Rourkela", "Odisha", "Sector 1, Rourkela, Sundargarh District – 769008", "https://www.nitrkl.ac.in", "https://www.nitrkl.ac.in/Careers/", "https://www.nitrkl.ac.in/Academics/AcademicAdmissions/PhD.aspx"],
  ["NIT Sikkim", "NIT Sikkim", "Ravangla", "Sikkim", "Ravangla, Namchi District – 737139", "https://nitsikkim.ac.in", "https://nitsikkim.ac.in/recruitment", "https://nitsikkim.ac.in/admission/phd_program.php"],
  ["NIT Silchar", "NIT Silchar", "Silchar", "Assam", "Silchar, Cachar District – 788010", "https://nits.ac.in", "https://nits.ac.in/recruitment", "https://nits.ac.in/admissions/phd"],
  ["NIT Srinagar", "NIT Srinagar", "Srinagar", "Jammu & Kashmir", "Hazratbal, Srinagar – 190006", "https://nitsri.ac.in", "https://nitsri.ac.in/jobs.aspx", "https://nitsri.ac.in/admissions.aspx"],
  ["SVNIT Surat", "SVNIT Surat", "Surat", "Gujarat", "Ichchhanath, Dumas Road, Surat – 395007", "https://www.svnit.ac.in", "https://www.svnit.ac.in/web/jobs.php", "https://www.svnit.ac.in/web/phd.php"],
  ["NIT Karnataka, Surathkal", "NITK Surathkal", "Mangaluru", "Karnataka", "Srinivasnagar PO, Surathkal, Mangaluru – 575025", "https://www.nitk.ac.in", "https://www.nitk.ac.in/career-opportunities", "https://www.nitk.ac.in/admissions/phd"],
  ["NIT Tiruchirappalli", "NIT Trichy", "Tiruchirappalli", "Tamil Nadu", "Tanjore Main Road, NH-67, Tiruchirappalli – 620015", "https://www.nitt.edu", "https://www.nitt.edu/home/other/jobs/", "https://www.nitt.edu/home/admissions/phd/"],
  ["NIT Uttarakhand", "NIT Uttarakhand", "Srinagar (Garhwal)", "Uttarakhand", "Sumari, Srinagar (Garhwal), Pauri Garhwal – 246174", "https://nituk.ac.in", "https://nituk.ac.in/jobs", "https://nituk.ac.in/phd-admissions"],
  ["NIT Warangal", "NIT Warangal", "Warangal", "Telangana", "Hanamkonda, Warangal – 506004", "https://www.nitw.ac.in", "https://www.nitw.ac.in/recruitment", "https://www.nitw.ac.in/path/?dept=/academic/phd"],
  ["VNIT Nagpur", "VNIT Nagpur", "Nagpur", "Maharashtra", "South Ambazari Road, Nagpur – 440010", "https://vnit.ac.in", "https://vnit.ac.in/careers/", "https://vnit.ac.in/admissions/ph-d/"]
];

nitData.forEach(d => addInst("NIT", "National Institutes of Technology", d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7], "Engineering, Applied Sciences, Computing, Electronics, Materials"));

// 4. IIITs (28)
const iiitData = [
  ["ABV-IIITM Gwalior (MoE, CFTI)", "IIITM Gwalior", "Gwalior", "Madhya Pradesh", "Morena Link Road, Gwalior – 474015", "https://www.iiitm.ac.in", "IT, Management, VLSI, Wireless"],
  ["IIIT Allahabad (MoE, CFTI)", "IIIT Allahabad", "Prayagraj", "Uttar Pradesh", "Devghat, Jhalwa, Prayagraj – 211015", "https://www.iiita.ac.in", "AI, Robotics, Bioinformatics, Software Systems"],
  ["IIITDM Jabalpur (MoE, CFTI)", "IIITDM Jabalpur", "Jabalpur", "Madhya Pradesh", "Dumna Airport Road, PO Khamaria, Jabalpur – 482005", "https://www.iiitdmj.ac.in", "Design and Manufacturing, Mechatronics"],
  ["IIITDM Kancheepuram (MoE, CFTI)", "IIITDM Kancheepuram", "Chennai", "Tamil Nadu", "Vandalur–Kelambakkam Road, Melakottaiyur, Chennai – 600127", "https://www.iiitdm.ac.in", "Smart Manufacturing, VLSI, Embedded Systems"],
  ["IIITDM Kurnool (MoE, CFTI)", "IIITDM Kurnool", "Kurnool", "Andhra Pradesh", "Jagannathagattu, Dinnedevarapadu, Kurnool – 518008", "https://iiitk.ac.in", "Design, Automation, Computing"],
  ["IIIT Sri City (PPP)", "IIIT Sri City", "Sri City", "Andhra Pradesh", "630 Gnan Marg, Sri City, Tirupati District – 517646", "https://www.iiits.ac.in", "Cybersecurity, AI, Smart Cities"],
  ["IIIT Guwahati (PPP)", "IIIT Guwahati", "Guwahati", "Assam", "Bongora, Guwahati – 781015", "https://www.iiitg.ac.in", "NLP, Computer Vision, Signal Processing"],
  ["IIIT Vadodara (PPP)", "IIIT Vadodara", "Gandhinagar", "Gujarat", "Govt. Engineering College Campus, Sector 28, Gandhinagar – 382028", "https://iiitvadodara.ac.in", "Data Science, Communication Systems"],
  ["IIIT Surat (PPP)", "IIIT Surat", "Surat", "Gujarat", "SVNIT Campus (transit), Ichchhanath, Surat – 395007", "https://iiitsurat.ac.in", "AI, High Performance Computing"],
  ["IIIT Kota (PPP)", "IIIT Kota", "Kota", "Rajasthan", "Ranpur, Kota – 325003", "https://iiitkota.ac.in", "Software Engineering, AI, IoT"],
  ["IIIT Tiruchirappalli (PPP)", "IIIT Trichy", "Tiruchirappalli", "Tamil Nadu", "Sethurapatti, Tiruchirappalli – 620012", "https://www.iiitt.ac.in", "Wireless Communication, Machine Intelligence"],
  ["IIIT Una (PPP)", "IIIT Una", "Una", "Himachal Pradesh", "Saloh, Una – 177209", "https://iiitu.ac.in", "Data Mining, Cyber Security"],
  ["IIIT Sonepat (PPP)", "IIIT Sonepat", "Sonepat", "Haryana", "Rajiv Gandhi Education City, Sonepat – 131029", "https://iiitsonepat.ac.in", "Information Technology, Advanced Computing"],
  ["IIIT Kalyani (PPP)", "IIIT Kalyani", "Kalyani", "West Bengal", "Kalyani, Nadia District – 741235", "https://iiitkalyani.ac.in", "Theoretical CS, Network Security, Big Data"],
  ["IIIT Lucknow (PPP)", "IIIT Lucknow", "Lucknow", "Uttar Pradesh", "Chak Ganjaria, C.G. City, Lucknow – 226002", "https://iiitl.ac.in", "AI/ML, Business Computing, Cloud Computing"],
  ["IIIT Dharwad (PPP)", "IIIT Dharwad", "Dharwad", "Karnataka", "Ittigatti Road, Near Sattur Colony, Dharwad – 580009", "https://iiitdwd.ac.in", "Data Science, Intelligent Systems"],
  ["IIIT Raichur (PPP)", "IIIT Raichur", "Raichur", "Karnataka", "Govt. Engineering College Campus, Yermarus Camp, Raichur – 584135", "https://iiitr.ac.in", "AI, Computer Science, Embedded Hardware"],
  ["IIIT Kottayam (PPP)", "IIIT Kottayam", "Kottayam", "Kerala", "Valavoor PO, Pala, Kottayam – 686635", "https://www.iiitkottayam.ac.in", "Cyber Security, Cloud Computing, AI"],
  ["IIIT Manipur (PPP)", "IIIT Manipur", "Imphal", "Manipur", "Mantripukhri, Imphal – 795002", "https://www.iiitmanipur.ac.in", "Language Processing, Signal Processing"],
  ["IIIT Nagpur (PPP)", "IIIT Nagpur", "Nagpur", "Maharashtra", "Survey No. 140/141-1, Waranga, Nagpur – 441108", "https://iiitn.ac.in", "Deep Learning, IoT, Wireless Sensor Networks"],
  ["IIIT Pune (PPP)", "IIIT Pune", "Pune", "Maharashtra", "Nanded City, Sinhagad Road, Pune – 411041", "https://www.iiitp.ac.in", "Autonomous Systems, Data Engineering"],
  ["IIIT Ranchi (PPP)", "IIIT Ranchi", "Ranchi", "Jharkhand", "Ranchi Smart City Area, Ranchi – 834004", "https://iiitranchi.ac.in", "Smart Systems, Communications"],
  ["IIIT Bhopal (PPP)", "IIIT Bhopal", "Bhopal", "Madhya Pradesh", "MANIT Campus, Link Road No. 3, Bhopal – 462003", "https://iiitbhopal.ac.in", "Computing, Information Technology"],
  ["IIIT Bhagalpur (PPP)", "IIIT Bhagalpur", "Bhagalpur", "Bihar", "Sabour, Bhagalpur – 813210", "https://www.iiitbh.ac.in", "Mechatronics, AI, Signal Processing"],
  ["IIIT Agartala (PPP)", "IIIT Agartala", "Agartala", "Tripura", "NIT Agartala Campus, Barjala, Jirania – 799046", "https://www.iiitagartala.ac.in", "Computer Science, Data Engineering"],
  ["IIIT Hyderabad (Deemed, research-intensive)", "IIIT Hyderabad", "Hyderabad", "Telangana", "Prof. C.R. Rao Road, Gachibowli, Hyderabad – 500032", "https://www.iiit.ac.in", "Computer Vision, Language Tech, Robotics, AI, Software Engg"],
  ["IIIT-Delhi (State university)", "IIIT Delhi", "New Delhi", "Delhi", "Okhla Industrial Estate Phase III, New Delhi – 110020", "https://iiitd.ac.in", "Computational Biology, Human-Centered Design, AI, Security"],
  ["IIIT Bangalore (Deemed)", "IIIT Bangalore", "Bengaluru", "Karnataka", "26/C Electronics City, Hosur Road, Bengaluru – 560100", "https://www.iiitb.ac.in", "Data Sciences, Networking, Software Engineering, VLSI"]
];

iiitData.forEach(d => addInst("IIIT", "Indian Institutes of Information Technology", d[0], d[1], d[2], d[3], d[4], d[5], d[5] + "/careers", d[5] + "/admissions", d[6]));

// 5. CSIR National Laboratories (38)
const csirData = [
  ["CSIR Headquarters", "CSIR HQ", "New Delhi", "Delhi", "Anusandhan Bhawan, 2 Rafi Marg, New Delhi – 110001", "https://www.csir.res.in", "Apex body – 37 national laboratories"],
  ["CSIR-AMPRI", "AMPRI Bhopal", "Bhopal", "Madhya Pradesh", "Hoshangabad Road, Near Habibganj Naka, Bhopal – 462026", "https://ampri.res.in", "Advanced materials & processes"],
  ["CSIR-CBRI", "CBRI Roorkee", "Roorkee", "Uttarakhand", "Roorkee – 247667", "https://cbri.res.in", "Building research, disaster mitigation"],
  ["CSIR-CCMB", "CCMB Hyderabad", "Hyderabad", "Telangana", "Uppal Road, Habsiguda, Hyderabad – 500007", "https://www.ccmb.res.in", "Cellular & molecular biology, genomics"],
  ["CSIR-CDRI", "CDRI Lucknow", "Lucknow", "Uttar Pradesh", "Sector 10, Jankipuram Extension, Sitapur Road, Lucknow – 226031", "https://cdri.res.in", "Drug discovery & development"],
  ["CSIR-CECRI", "CECRI Karaikudi", "Karaikudi", "Tamil Nadu", "Karaikudi – 630003", "https://cecri.res.in", "Electrochemistry, batteries, corrosion"],
  ["CSIR-CEERI", "CEERI Pilani", "Pilani", "Rajasthan", "Pilani – 333031", "https://www.ceeri.res.in", "Electronics, semiconductors, sensors"],
  ["CSIR-CFTRI", "CFTRI Mysuru", "Mysuru", "Karnataka", "Cheluvamba Mansion, KRS Road, Mysuru – 570020", "https://cftri.res.in", "Food science & technology"],
  ["CSIR-CGCRI", "CGCRI Kolkata", "Kolkata", "West Bengal", "196 Raja S.C. Mullick Road, Jadavpur, Kolkata – 700032", "https://www.cgcri.res.in", "Glass, ceramics, photonics"],
  ["CSIR-CIMAP", "CIMAP Lucknow", "Lucknow", "Uttar Pradesh", "PO CIMAP, Near Kukrail Picnic Spot, Lucknow – 226015", "https://www.cimap.res.in", "Medicinal & aromatic plants"],
  ["CSIR-CIMFR", "CIMFR Dhanbad", "Dhanbad", "Jharkhand", "Barwa Road, Dhanbad – 826015", "https://cimfr.csir.res.in", "Mining & fuel research"],
  ["CSIR-CLRI", "CLRI Chennai", "Chennai", "Tamil Nadu", "Sardar Patel Road, Adyar, Chennai – 600020", "https://clri.org", "Leather science & technology"],
  ["CSIR-CMERI", "CMERI Durgapur", "Durgapur", "West Bengal", "Mahatma Gandhi Avenue, Durgapur – 713209", "https://www.cmeri.res.in", "Mechanical engineering, robotics"],
  ["CSIR-CRRI", "CRRI New Delhi", "New Delhi", "Delhi", "Delhi–Mathura Road, New Delhi – 110025", "https://crridom.gov.in", "Road & transport research"],
  ["CSIR-CSIO", "CSIO Chandigarh", "Chandigarh", "Chandigarh (UT)", "Sector 30-C, Chandigarh – 160030", "https://www.csio.res.in", "Scientific instruments, optics"],
  ["CSIR-CSMCRI", "CSMCRI Bhavnagar", "Bhavnagar", "Gujarat", "Gijubhai Badheka Marg, Bhavnagar – 364002", "https://www.csmcri.res.in", "Salt, marine chemicals, membranes"],
  ["CSIR-IGIB", "IGIB Delhi", "New Delhi", "Delhi", "Mall Road, Delhi University Campus, Delhi – 110007", "https://www.igib.res.in", "Genomics & integrative biology"],
  ["CSIR-IHBT", "IHBT Palampur", "Palampur", "Himachal Pradesh", "Post Box No. 6, Palampur, Kangra District – 176061", "https://www.ihbt.res.in", "Himalayan bioresource technology"],
  ["CSIR-IICB", "IICB Kolkata", "Kolkata", "West Bengal", "4 Raja S.C. Mullick Road, Jadavpur, Kolkata – 700032", "https://iicb.res.in", "Chemical biology"],
  ["CSIR-IICT", "IICT Hyderabad", "Hyderabad", "Telangana", "Tarnaka, Uppal Road, Hyderabad – 500007", "https://www.iict.res.in", "Chemical technology"],
  ["CSIR-IIIM", "IIIM Jammu", "Jammu", "Jammu & Kashmir", "Canal Road, Jammu – 180001", "https://iiim.res.in", "Integrative medicine, natural products"],
  ["CSIR-IIP", "IIP Dehradun", "Dehradun", "Uttarakhand", "Haridwar Road, Mohkampur, Dehradun – 248005", "https://www.iip.res.in", "Petroleum & fuels"],
  ["CSIR-IITR", "IITR Lucknow", "Lucknow", "Uttar Pradesh", "Vishvigyan Bhawan, 31 Mahatma Gandhi Marg, Lucknow – 226001", "https://iitrindia.org", "Toxicology, safety testing"],
  ["CSIR-IMMT", "IMMT Bhubaneswar", "Bhubaneswar", "Odisha", "Acharya Vihar, Bhubaneswar – 751013", "https://www.immt.res.in", "Minerals & materials technology"],
  ["CSIR-IMTECH", "IMTECH Chandigarh", "Chandigarh", "Chandigarh (UT)", "Sector 39-A, Chandigarh – 160036", "https://www.imtech.res.in", "Microbial technology"],
  ["CSIR-NAL", "NAL Bengaluru", "Bengaluru", "Karnataka", "HAL Airport Road, Kodihalli, Bengaluru – 560017", "https://www.nal.res.in", "Aerospace"],
  ["CSIR-NBRI", "NBRI Lucknow", "Lucknow", "Uttar Pradesh", "Rana Pratap Marg, Lucknow – 226001", "https://nbri.res.in", "Botanical research"],
  ["CSIR-NCL", "NCL Pune", "Pune", "Maharashtra", "Dr. Homi Bhabha Road, Pashan, Pune – 411008", "https://www.ncl-india.org", "Chemistry, catalysis, polymers"],
  ["CSIR-NEERI", "NEERI Nagpur", "Nagpur", "Maharashtra", "Nehru Marg, Nagpur – 440020", "https://www.neeri.res.in", "Environmental engineering"],
  ["CSIR-NEIST", "NEIST Jorhat", "Jorhat", "Assam", "Jorhat – 785006", "https://www.neist.res.in", "North-East science & technology"],
  ["CSIR-NGRI", "NGRI Hyderabad", "Hyderabad", "Telangana", "Uppal Road, Hyderabad – 500007", "https://www.ngri.res.in", "Geophysics"],
  ["CSIR-NIIST", "NIIST TVM", "Thiruvananthapuram", "Kerala", "Industrial Estate PO, Pappanamcode, Thiruvananthapuram – 695019", "https://www.niist.res.in", "Interdisciplinary science & technology"],
  ["CSIR-NIO", "NIO Goa", "Panaji", "Goa", "Dona Paula – 403004", "https://www.nio.res.in", "Oceanography"],
  ["CSIR-NML", "NML Jamshedpur", "Jamshedpur", "Jharkhand", "Burmamines, Jamshedpur – 831007", "https://www.nmlindia.org", "Metallurgy"],
  ["CSIR-NPL", "NPL New Delhi", "New Delhi", "Delhi", "Dr. K.S. Krishnan Marg, New Delhi – 110012", "https://www.nplindia.org", "Physics, national measurement standards"],
  ["CSIR-SERC", "SERC Chennai", "Chennai", "Tamil Nadu", "CSIR Road, Taramani, Chennai – 600113", "https://serc.res.in", "Structural engineering & testing"],
  ["CSIR-4PI", "CSIR-4PI Bengaluru", "Bengaluru", "Karnataka", "NAL Belur Campus, Bengaluru – 560037", "https://www.csir4pi.in", "Mathematical modelling, supercomputing"],
  ["CSIR-NIScPR", "NIScPR New Delhi", "New Delhi", "Delhi", "14 Satsang Vihar Marg, New Delhi – 110067", "https://niscpr.res.in", "Science communication & policy"]
];

csirData.forEach(d => addInst("CSIR", "CSIR National Laboratories", d[0], d[1], d[2], d[3], d[4], d[5], d[5] + "/careers", "https://www.acsir.res.in", d[6]));

// 6. Other Government Research & Testing Organisations
// 6.1 DAE (12)
const daeData = [
  ["Bhabha Atomic Research Centre (BARC)", "BARC", "Mumbai", "Maharashtra", "Trombay, Mumbai – 400085", "https://www.barc.gov.in", "Nuclear science & engineering"],
  ["Indira Gandhi Centre for Atomic Research (IGCAR)", "IGCAR", "Kalpakkam", "Tamil Nadu", "Kalpakkam, Chengalpattu District – 603102", "https://www.igcar.gov.in", "Fast breeder reactors"],
  ["Raja Ramanna Centre for Advanced Technology (RRCAT)", "RRCAT", "Indore", "Madhya Pradesh", "Sukhniwas, Rau, Indore – 452013", "https://www.rrcat.gov.in", "Lasers & particle accelerators"],
  ["Variable Energy Cyclotron Centre (VECC)", "VECC", "Kolkata", "West Bengal", "1/AF Bidhannagar, Kolkata – 700064", "https://www.vecc.gov.in", "Accelerator physics"],
  ["Tata Institute of Fundamental Research (TIFR)", "TIFR Mumbai", "Mumbai", "Maharashtra", "Homi Bhabha Road, Colaba, Mumbai – 400005", "https://www.tifr.res.in", "Fundamental sciences"],
  ["Saha Institute of Nuclear Physics (SINP)", "SINP", "Kolkata", "West Bengal", "1/AF Bidhannagar, Kolkata – 700064", "http://www.saha.ac.in", "Nuclear & biophysics"],
  ["Institute for Plasma Research (IPR)", "IPR Gandhinagar", "Gandhinagar", "Gujarat", "Near Indira Bridge, Bhat, Gandhinagar – 382428", "https://www.ipr.res.in", "Plasma physics, fusion"],
  ["Institute of Physics (IOP)", "IOP Bhubaneswar", "Bhubaneswar", "Odisha", "Sachivalaya Marg, Bhubaneswar – 751005", "https://www.iopb.res.in", "Physics"],
  ["Harish-Chandra Research Institute (HRI)", "HRI Prayagraj", "Prayagraj", "Uttar Pradesh", "Chhatnag Road, Jhunsi, Prayagraj – 211019", "http://www.hri.res.in", "Mathematics & physics"],
  ["Institute of Mathematical Sciences (IMSc)", "IMSc Chennai", "Chennai", "Tamil Nadu", "CIT Campus, Taramani, Chennai – 600113", "https://www.imsc.res.in", "Mathematics & theoretical sciences"],
  ["Tata Memorial Centre – ACTREC", "ACTREC Navi Mumbai", "Navi Mumbai", "Maharashtra", "Sector 22, Kharghar, Navi Mumbai – 410210", "https://actrec.gov.in", "Cancer research & treatment"],
  ["National Centre for Biological Sciences (NCBS-TIFR)", "NCBS Bengaluru", "Bengaluru", "Karnataka", "GKVK, Bellary Road, Bengaluru – 560065", "https://www.ncbs.res.in", "Biology"]
];
daeData.forEach(d => addInst("Govt R&D", "Department of Atomic Energy (DAE)", d[0], d[1], d[2], d[3], d[4], d[5], d[5] + "/careers", d[5] + "/phd", d[6]));

// 6.2 ISRO (7)
const isroData = [
  ["ISRO Headquarters", "ISRO HQ", "Bengaluru", "Karnataka", "Antariksh Bhavan, New BEL Road, Bengaluru – 560094", "https://www.isro.gov.in", "Space programme"],
  ["Vikram Sarabhai Space Centre (VSSC)", "VSSC", "Thiruvananthapuram", "Kerala", "ISRO PO, Veli, Thiruvananthapuram – 695022", "https://www.vssc.gov.in", "Launch vehicles"],
  ["U R Rao Satellite Centre (URSC)", "URSC", "Bengaluru", "Karnataka", "Old Airport Road, Vimanapura PO, Bengaluru – 560017", "https://www.ursc.gov.in", "Satellites"],
  ["Space Applications Centre (SAC)", "SAC", "Ahmedabad", "Gujarat", "Jodhpur Tekra, Ambawadi Vistar PO, Ahmedabad – 380015", "https://www.sac.gov.in", "Payloads & applications"],
  ["Satish Dhawan Space Centre (SDSC-SHAR)", "SDSC SHAR", "Sriharikota", "Andhra Pradesh", "Sriharikota, Tirupati District – 524124", "https://www.shar.gov.in", "Launch centre"],
  ["Physical Research Laboratory (PRL)", "PRL Ahmedabad", "Ahmedabad", "Gujarat", "Navrangpura, Ahmedabad – 380009", "https://www.prl.res.in", "Space & planetary science"],
  ["National Remote Sensing Centre (NRSC)", "NRSC", "Hyderabad", "Telangana", "Balanagar, Hyderabad – 500037", "https://www.nrsc.gov.in", "Remote sensing"]
];
isroData.forEach(d => addInst("Govt R&D", "Department of Space (ISRO)", d[0], d[1], d[2], d[3], d[4], d[5], "https://www.isro.gov.in/Careers.html", d[5] + "/phd", d[6]));

// 6.3 DRDO (9)
const drdoData = [
  ["DRDO Headquarters", "DRDO HQ", "New Delhi", "Delhi", "DRDO Bhawan, Rajaji Marg, New Delhi – 110011", "https://www.drdo.gov.in", "Defence R&D"],
  ["Defence Research & Development Laboratory (DRDL)", "DRDL", "Hyderabad", "Telangana", "Kanchanbagh, Hyderabad – 500058", "https://www.drdo.gov.in/drdo/labs-and-establishments/defence-research-development-laboratory-drdl", "Missiles"],
  ["Defence Metallurgical Research Laboratory (DMRL)", "DMRL", "Hyderabad", "Telangana", "Kanchanbagh, Hyderabad – 500058", "https://www.drdo.gov.in/drdo/labs-and-establishments/defence-metallurgical-research-laboratory-dmrl", "Advanced materials"],
  ["Defence Research & Development Establishment (DRDE)", "DRDE", "Gwalior", "Madhya Pradesh", "Jhansi Road, Gwalior – 474002", "https://www.drdo.gov.in/drdo/labs-and-establishments/defence-research-development-establishment-drde", "Chemical & biological defence"],
  ["Armament Research & Development Establishment (ARDE)", "ARDE", "Pune", "Maharashtra", "Pashan, Pune – 411021", "https://www.drdo.gov.in/drdo/labs-and-establishments/armament-research-development-establishment-arde", "Armaments"],
  ["Gas Turbine Research Establishment (GTRE)", "GTRE", "Bengaluru", "Karnataka", "C.V. Raman Nagar, Bengaluru – 560093", "https://www.drdo.gov.in/drdo/labs-and-establishments/gas-turbine-research-establishment-gtre", "Aero engines"],
  ["Combat Vehicles R&D Establishment (CVRDE)", "CVRDE", "Chennai", "Tamil Nadu", "Avadi, Chennai – 600054", "https://www.drdo.gov.in/drdo/labs-and-establishments/combat-vehicles-research-development-establishment-cvrde", "Combat vehicles"],
  ["Institute of Nuclear Medicine & Allied Sciences (INMAS)", "INMAS", "New Delhi", "Delhi", "Brig. S.K. Mazumdar Marg, Timarpur, Delhi – 110054", "https://www.drdo.gov.in/drdo/labs-and-establishments/institute-nuclear-medicine-allied-sciences-inmas", "Nuclear medicine"],
  ["Solid State Physics Laboratory (SSPL)", "SSPL", "New Delhi", "Delhi", "Lucknow Road, Timarpur, Delhi – 110054", "https://www.drdo.gov.in/drdo/labs-and-establishments/solid-state-physics-laboratory-sspl", "Semiconductors"]
];
drdoData.forEach(d => addInst("Govt R&D", "Defence Research & Development Organisation (DRDO)", d[0], d[1], d[2], d[3], d[4], d[5], "https://rac.gov.in", "https://rac.gov.in", d[6]));

// 6.4 ICMR (9)
const icmrData = [
  ["ICMR Headquarters", "ICMR HQ", "New Delhi", "Delhi", "V. Ramalingaswami Bhawan, Ansari Nagar, New Delhi – 110029", "https://main.icmr.nic.in", "Biomedical research"],
  ["National Institute of Virology (NIV)", "NIV Pune", "Pune", "Maharashtra", "20-A, Dr. Ambedkar Road, Pune – 411001", "https://www.niv.co.in", "Virology, BSL-3/4 labs"],
  ["National Institute of Nutrition (NIN)", "NIN Hyderabad", "Hyderabad", "Telangana", "Jamai-Osmania PO, Tarnaka, Hyderabad – 500007", "https://www.nin.res.in", "Nutrition"],
  ["National Institute for Research in Tuberculosis (NIRT)", "NIRT Chennai", "Chennai", "Tamil Nadu", "Mayor Sathyamoorthy Road, Chetpet, Chennai – 600031", "http://www.nirt.res.in", "Tuberculosis"],
  ["National Institute of Epidemiology (NIE)", "NIE Chennai", "Chennai", "Tamil Nadu", "R-127, TNHB, Ayapakkam, Chennai – 600077", "http://nie.gov.in", "Epidemiology"],
  ["National Institute of Malaria Research (NIMR)", "NIMR Delhi", "New Delhi", "Delhi", "Sector 8, Dwarka, New Delhi – 110077", "https://nimr.icmr.org.in", "Malaria"],
  ["ICMR-NIRBI (formerly NICED)", "ICMR-NIRBI", "Kolkata", "West Bengal", "P-33, CIT Road, Scheme XM, Beliaghata, Kolkata – 700010", "https://www.niced.org.in", "Bacterial infections"],
  ["National Institute of Occupational Health (NIOH)", "NIOH Ahmedabad", "Ahmedabad", "Gujarat", "Meghaninagar, Ahmedabad – 380016", "http://www.nioh.org", "Occupational health"],
  ["Regional Medical Research Centre (RMRC)", "RMRC Bhubaneswar", "Bhubaneswar", "Odisha", "Chandrasekharpur, Bhubaneswar – 751023", "https://rmrcbbsr.icmr.org.in", "Tribal & regional health"]
];
icmrData.forEach(d => addInst("Govt R&D", "Indian Council of Medical Research (ICMR)", d[0], d[1], d[2], d[3], d[4], d[5], d[5] + "/career", d[5] + "/phd", d[6]));

// 6.5 DBT / BRIC (11)
const dbtData = [
  ["National Institute of Immunology (NII)", "NII Delhi", "New Delhi", "Delhi", "Aruna Asaf Ali Marg, New Delhi – 110067", "http://www.nii.res.in", "Immunology"],
  ["National Centre for Cell Science (NCCS)", "NCCS Pune", "Pune", "Maharashtra", "S.P. Pune University Campus, Ganeshkhind, Pune – 411007", "https://www.nccs.res.in", "Cell biology"],
  ["Centre for DNA Fingerprinting & Diagnostics (CDFD)", "CDFD Hyderabad", "Hyderabad", "Telangana", "Inner Ring Road, Uppal, Hyderabad – 500039", "http://www.cdfd.org.in", "DNA diagnostics"],
  ["National Brain Research Centre (NBRC)", "NBRC Manesar", "Gurugram", "Haryana", "NH-48, Manesar, Gurugram – 122052", "http://www.nbrc.ac.in", "Neuroscience"],
  ["Translational Health Science & Technology Institute (THSTI)", "THSTI Faridabad", "Faridabad", "Haryana", "NCR Biotech Science Cluster, Faridabad – 121001", "https://thsti.res.in", "Translational medicine"],
  ["Regional Centre for Biotechnology (RCB)", "RCB Faridabad", "Faridabad", "Haryana", "NCR Biotech Science Cluster, Faridabad – 121001", "https://www.rcb.res.in", "Biotechnology education & research"],
  ["Institute of Life Sciences (ILS)", "ILS Bhubaneswar", "Bhubaneswar", "Odisha", "NALCO Square, Chandrasekharpur, Bhubaneswar – 751023", "https://www.ils.res.in", "Infectious disease, genetics"],
  ["Rajiv Gandhi Centre for Biotechnology (RGCB)", "RGCB TVM", "Thiruvananthapuram", "Kerala", "Thycaud PO, Poojappura, Thiruvananthapuram – 695014", "https://rgcb.res.in", "Disease biology"],
  ["National Institute of Plant Genome Research (NIPGR)", "NIPGR Delhi", "New Delhi", "Delhi", "Aruna Asaf Ali Marg, New Delhi – 110067", "http://www.nipgr.ac.in", "Plant genomics"],
  ["National Agri-Food Biotechnology Institute (NABI)", "NABI Mohali", "Mohali", "Punjab", "Sector 81, SAS Nagar, Mohali – 140306", "https://nabi.res.in", "Agri-food biotech"],
  ["inStem", "inStem Bengaluru", "Bengaluru", "Karnataka", "GKVK Campus, Bellary Road, Bengaluru – 560065", "https://instem.res.in", "Stem cell & regenerative biology"]
];
dbtData.forEach(d => addInst("Govt R&D", "Department of Biotechnology (DBT / BRIC)", d[0], d[1], d[2], d[3], d[4], d[5], d[5] + "/careers", d[5] + "/phd", d[6]));

// 6.6 DST Autonomous Institutes (12)
const dstData = [
  ["Jawaharlal Nehru Centre for Advanced Scientific Research (JNCASR)", "JNCASR", "Bengaluru", "Karnataka", "Jakkur, Bengaluru – 560064", "http://www.jncasr.ac.in", "Materials, chemistry, biology"],
  ["Indian Association for the Cultivation of Science (IACS)", "IACS Kolkata", "Kolkata", "West Bengal", "2A & 2B Raja S.C. Mullick Road, Jadavpur, Kolkata – 700032", "http://iacs.res.in", "Basic sciences"],
  ["Raman Research Institute (RRI)", "RRI Bengaluru", "Bengaluru", "Karnataka", "C.V. Raman Avenue, Sadashivanagar, Bengaluru – 560080", "http://www.rri.res.in", "Astronomy, soft matter"],
  ["Bose Institute", "Bose Institute", "Kolkata", "West Bengal", "EN-80, Sector V, Bidhannagar, Kolkata – 700091", "http://www.jcbose.ac.in", "Biology & physics"],
  ["S.N. Bose National Centre for Basic Sciences", "SNBose Centre", "Kolkata", "West Bengal", "JD Block, Sector III, Salt Lake, Kolkata – 700106", "http://newweb.bose.res.in", "Physical sciences"],
  ["Indian Institute of Astrophysics (IIA)", "IIA Bengaluru", "Bengaluru", "Karnataka", "II Block, Koramangala, Bengaluru – 560034", "https://www.iiap.res.in", "Astrophysics"],
  ["ARIES", "ARIES Nainital", "Nainital", "Uttarakhand", "Manora Peak, Nainital – 263001", "https://www.aries.res.in", "Observational astronomy"],
  ["ARCI", "ARCI Hyderabad", "Hyderabad", "Telangana", "Balapur PO, Hyderabad – 500005", "https://www.arci.res.in", "Powder metallurgy, new materials"],
  ["Institute of Nano Science & Technology (INST)", "INST Mohali", "Mohali", "Punjab", "Sector 81, Knowledge City, Mohali – 140306", "http://www.inst.ac.in", "Nanotechnology"],
  ["Sree Chitra Tirunal Institute for Medical Sciences & Technology (SCTIMST)", "SCTIMST TVM", "Thiruvananthapuram", "Kerala", "Medical College PO, Thiruvananthapuram – 695011", "https://www.sctimst.ac.in", "Medical devices, biomaterials"],
  ["Wadia Institute of Himalayan Geology", "WIHG Dehradun", "Dehradun", "Uttarakhand", "33 General Mahadev Singh Road, Dehradun – 248001", "http://www.wihg.res.in", "Himalayan geology"],
  ["Birbal Sahni Institute of Palaeosciences (BSIP)", "BSIP Lucknow", "Lucknow", "Uttar Pradesh", "53 University Road, Lucknow – 226007", "http://www.bsip.res.in", "Palaeosciences"]
];
dstData.forEach(d => addInst("Govt R&D", "Department of Science & Technology (DST)", d[0], d[1], d[2], d[3], d[4], d[5], d[5] + "/careers", d[5] + "/phd", d[6]));

// 6.7 Ministry of Earth Sciences, ICAR & Others (9)
const otherGovData = [
  ["Indian Institute of Tropical Meteorology (IITM)", "IITM Pune", "Pune", "Maharashtra", "Dr. Homi Bhabha Road, Pashan, Pune – 411008", "https://www.tropmet.res.in", "Climate & monsoon (MoES)"],
  ["National Centre for Polar & Ocean Research (NCPOR)", "NCPOR Goa", "Vasco-da-Gama", "Goa", "Headland Sada, Vasco-da-Gama – 403804", "https://ncpor.res.in", "Polar science (MoES)"],
  ["National Institute of Ocean Technology (NIOT)", "NIOT Chennai", "Chennai", "Tamil Nadu", "Velachery–Tambaram Main Road, Pallikaranai, Chennai – 600100", "https://www.niot.res.in", "Ocean technology (MoES)"],
  ["Indian Agricultural Research Institute (IARI)", "IARI Delhi", "New Delhi", "Delhi", "Pusa, New Delhi – 110012", "https://www.iari.res.in", "Agriculture (ICAR)"],
  ["National Dairy Research Institute (NDRI)", "NDRI Karnal", "Karnal", "Haryana", "Karnal – 132001", "http://www.ndri.res.in", "Dairy science (ICAR)"],
  ["Indian Veterinary Research Institute (IVRI)", "IVRI Bareilly", "Bareilly", "Uttar Pradesh", "Izatnagar, Bareilly – 243122", "http://www.ivri.nic.in", "Veterinary science (ICAR)"],
  ["National Rice Research Institute (NRRI)", "NRRI Cuttack", "Cuttack", "Odisha", "Bidyadharpur, Cuttack – 753006", "https://icar-nrri.in", "Rice research (ICAR)"],
  ["C-DAC", "C-DAC Pune", "Pune", "Maharashtra", "Panchavati, Pashan, Pune – 411008", "https://www.cdac.in", "Supercomputing, AI (MeitY)"],
  ["SAMEER", "SAMEER Mumbai", "Mumbai", "Maharashtra", "IIT Bombay Campus, Powai, Mumbai – 400076", "https://www.sameer.gov.in", "Microwave & RF engineering (MeitY)"]
];
otherGovData.forEach(d => addInst("Govt R&D", "Earth Sciences, ICAR & Others", d[0], d[1], d[2], d[3], d[4], d[5], d[5] + "/careers", d[5] + "/academic", d[6]));

// 6.8 Testing, Standards & Certification Laboratories (7)
const testLabData = [
  ["National Test House (NTH)", "NTH Kolkata", "Kolkata", "West Bengal", "Alipore, Kolkata – 700027", "https://nth.gov.in", "Materials & product testing"],
  ["Central Power Research Institute (CPRI)", "CPRI Bengaluru", "Bengaluru", "Karnataka", "Prof. Sir C.V. Raman Road, Sadashivanagar, Bengaluru – 560080", "https://cpri.res.in", "Electrical equipment testing"],
  ["STQC Directorate", "STQC New Delhi", "New Delhi", "Delhi", "Electronics Niketan, 6 CGO Complex, Lodhi Road, New Delhi – 110003", "https://stqc.gov.in", "Electronics & IT testing"],
  ["National Institute of Biologicals (NIB)", "NIB Noida", "Noida", "Uttar Pradesh", "A-32, Sector 62, Noida – 201309", "https://nib.gov.in", "Quality testing of biologicals"],
  ["Central Drugs Laboratory (CDL)", "CDL Kolkata", "Kolkata", "West Bengal", "3 Kyd Street, Kolkata – 700016", "https://cdsco.gov.in", "Drug testing"],
  ["International Centre for Automotive Technology (ICAT)", "ICAT Manesar", "Gurugram", "Haryana", "Plot 26, Sector 18, IMT Manesar, Gurugram – 122050", "https://www.icat.in", "Automotive testing & homologation"],
  ["Automotive Research Association of India (ARAI)", "ARAI Pune", "Pune", "Maharashtra", "Survey No. 102, Vetal Hill, Off Paud Road, Kothrud, Pune – 411038", "https://www.araiindia.com", "Automotive testing & certification"]
];
testLabData.forEach(d => addInst("Govt R&D", "Testing, Standards & Certification", d[0], d[1], d[2], d[3], d[4], d[5], d[5] + "/careers", d[5], d[6]));

// 7. All India Institutes of Medical Sciences (AIIMS) (23)
const aiimsData = [
  ["AIIMS New Delhi", "AIIMS Delhi", "New Delhi", "Delhi", "Ansari Nagar, New Delhi – 110029", "https://www.aiims.edu", "https://www.aiims.edu/en/notices/recruitment", "https://www.aiimsexams.ac.in", "Functional (est. 1956) - Apex Medical Research"],
  ["AIIMS Bhopal", "AIIMS Bhopal", "Bhopal", "Madhya Pradesh", "Saket Nagar, Bhopal – 462020", "https://aiimsbhopal.edu.in", "https://aiimsbhopal.edu.in/index.html#/vacancies", "https://aiimsbhopal.edu.in", "Clinical research, infectious diseases"],
  ["AIIMS Bhubaneswar", "AIIMS Bhubaneswar", "Bhubaneswar", "Odisha", "Sijua, Patrapada, Bhubaneswar – 751019", "https://aiimsbhubaneswar.nic.in", "https://aiimsbhubaneswar.nic.in/Recruitment.aspx", "https://aiimsbhubaneswar.nic.in", "Public health, oncology, surgery"],
  ["AIIMS Jodhpur", "AIIMS Jodhpur", "Jodhpur", "Rajasthan", "Basni Industrial Area, Phase-2, Jodhpur – 342005", "https://www.aiimsjodhpur.edu.in", "https://www.aiimsjodhpur.edu.in/faculty_recruitment.php", "https://www.aiimsjodhpur.edu.in", "Genomics, trauma care, telemedicine"],
  ["AIIMS Patna", "AIIMS Patna", "Patna", "Bihar", "Phulwarisharif, Patna – 801507", "https://aiimspatna.edu.in", "https://aiimspatna.edu.in/recruitment/", "https://aiimspatna.edu.in", "Tropical medicine, community healthcare"],
  ["AIIMS Raipur", "AIIMS Raipur", "Raipur", "Chhattisgarh", "G.E. Road, Tatibandh, Raipur – 492099", "https://www.aiimsraipur.edu.in", "https://www.aiimsraipur.edu.in/user/vacancies.php", "https://www.aiimsraipur.edu.in", "Sickle cell research, tribal health"],
  ["AIIMS Rishikesh", "AIIMS Rishikesh", "Rishikesh", "Uttarakhand", "Virbhadra Road, Rishikesh – 249203", "https://aiimsrishikesh.edu.in", "https://aiimsrishikesh.edu.in/a1_1/?page_id=233", "https://aiimsrishikesh.edu.in", "High altitude medicine, neurosurgery"],
  ["AIIMS Raebareli", "AIIMS Raebareli", "Raebareli", "Uttar Pradesh", "Munshiganj, Dalmau Road, Raebareli – 229405", "https://aiimsrbl.edu.in", "https://aiimsrbl.edu.in/recruitment.php", "https://aiimsrbl.edu.in", "Rural health, general medicine"],
  ["AIIMS Mangalagiri", "AIIMS Mangalagiri", "Mangalagiri", "Andhra Pradesh", "Mangalagiri, Guntur District – 522503", "https://www.aiimsmangalagiri.edu.in", "https://www.aiimsmangalagiri.edu.in/vacancies/", "https://www.aiimsmangalagiri.edu.in", "Cardiology, nephrology, diagnostics"],
  ["AIIMS Nagpur", "AIIMS Nagpur", "Nagpur", "Maharashtra", "Plot No. 2, Sector 20, MIHAN, Nagpur – 441108", "https://aiimsnagpur.edu.in", "https://aiimsnagpur.edu.in/recruitment_notices", "https://aiimsnagpur.edu.in", "Modern diagnostics, robotic surgery"],
  ["AIIMS Gorakhpur", "AIIMS Gorakhpur", "Gorakhpur", "Uttar Pradesh", "Kunraghat, Gorakhpur – 273008", "https://aiimsgorakhpur.edu.in", "https://aiimsgorakhpur.edu.in/recruitment/", "https://aiimsgorakhpur.edu.in", "Encephalitis research, pediatrics"],
  ["AIIMS Bathinda", "AIIMS Bathinda", "Bathinda", "Punjab", "Mandi Dabwali Road, Bathinda – 151001", "https://aiimsbathinda.edu.in", "https://aiimsbathinda.edu.in/recruitment.php", "https://aiimsbathinda.edu.in", "Oncology, heavy metal toxicity research"],
  ["AIIMS Bibinagar", "AIIMS Bibinagar", "Bibinagar (Hyderabad)", "Telangana", "Bibinagar, Yadadri Bhuvanagiri District – 508126", "https://aiimsbibinagar.edu.in", "https://aiimsbibinagar.edu.in/recruitment.php", "https://aiimsbibinagar.edu.in", "Biomedical sciences, epidemiology"],
  ["AIIMS Kalyani", "AIIMS Kalyani", "Kalyani", "West Bengal", "NH-34 Connector, Basantapur, Saguna, Kalyani – 741245", "https://aiimskalyani.edu.in", "https://aiimskalyani.edu.in/recruitment", "https://aiimskalyani.edu.in", "Infectious diseases, hematology"],
  ["AIIMS Deoghar", "AIIMS Deoghar", "Deoghar", "Jharkhand", "Devipur, Deoghar – 814152", "https://www.aiimsdeoghar.edu.in", "https://www.aiimsdeoghar.edu.in/vacancies", "https://www.aiimsdeoghar.edu.in", "Community health, tribal healthcare"],
  ["AIIMS Bilaspur", "AIIMS Bilaspur", "Bilaspur", "Himachal Pradesh", "Kothipura, Bilaspur – 174001", "https://www.aiimsbilaspur.edu.in", "https://www.aiimsbilaspur.edu.in/recruitment", "https://www.aiimsbilaspur.edu.in", "Mountain medicine, orthopedics"],
  ["AIIMS Guwahati", "AIIMS Guwahati", "Guwahati", "Assam", "Changsari, Kamrup District – 781101", "https://aiimsguwahati.ac.in", "https://aiimsguwahati.ac.in/recruitment", "https://aiimsguwahati.ac.in", "North-East public health, herbal drug discovery"],
  ["AIIMS Rajkot", "AIIMS Rajkot", "Rajkot", "Gujarat", "Khandheri, Para Pipaliya, Rajkot – 360006", "https://aiimsrajkot.edu.in", "https://aiimsrajkot.edu.in/recruitment", "https://aiimsrajkot.edu.in", "Cardiology, emergency medicine"],
  ["AIIMS Jammu", "AIIMS Jammu", "Jammu", "Jammu & Kashmir", "Vijaypur, Samba District – 184120", "https://aiimsjammu.edu.in", "https://aiimsjammu.edu.in/recruitment", "https://aiimsjammu.edu.in", "Trauma care, cold weather physiology"],
  ["AIIMS Madurai", "AIIMS Madurai", "Madurai", "Tamil Nadu", "Thoppur, Madurai – 625008", "https://aiimsmadurai.edu.in", "https://aiimsmadurai.edu.in/recruitment", "https://aiimsmadurai.edu.in", "Partially functional / campus development"],
  ["AIIMS Awantipora", "AIIMS Awantipora", "Awantipora", "Jammu & Kashmir", "Awantipora, Pulwama District – 192122", "https://www.mohfw.gov.in", "https://www.mohfw.gov.in", "https://www.mohfw.gov.in", "Under construction"],
  ["AIIMS Rewari", "AIIMS Rewari", "Rewari", "Haryana", "Majra, Rewari District", "https://www.mohfw.gov.in", "https://www.mohfw.gov.in", "https://www.mohfw.gov.in", "Under construction"],
  ["AIIMS Darbhanga", "AIIMS Darbhanga", "Darbhanga", "Bihar", "Shobhan, Darbhanga District", "https://www.mohfw.gov.in", "https://www.mohfw.gov.in", "https://www.mohfw.gov.in", "Under construction"]
];
aiimsData.forEach(d => addInst("AIIMS", "All India Institutes of Medical Sciences", d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8]));

// 8. Top Private Universities in Research (25)
const pvtData = [
  ["Manipal Academy of Higher Education (MAHE)", "MAHE Manipal", "Manipal", "Karnataka", "Madhav Nagar, Manipal, Udupi District – 576104", "https://manipal.edu", "Medicine, health sciences, engineering"],
  ["Amrita Vishwa Vidyapeetham", "Amrita University", "Coimbatore", "Tamil Nadu", "Amritanagar, Ettimadai, Coimbatore – 641112", "https://www.amrita.edu", "Engineering, medicine, AI, wireless networks"],
  ["Vellore Institute of Technology (VIT)", "VIT Vellore", "Vellore", "Tamil Nadu", "Katpadi, Vellore – 632014", "https://vit.ac.in", "Engineering, materials, nanotech"],
  ["Birla Institute of Technology & Science (BITS) Pilani", "BITS Pilani", "Pilani", "Rajasthan", "Vidya Vihar, Pilani, Jhunjhunu District – 333031", "https://www.bits-pilani.ac.in", "Engineering, pharmacy, sciences"],
  ["SRM Institute of Science & Technology", "SRM IST", "Chennai", "Tamil Nadu", "SRM Nagar, Kattankulathur, Chengalpattu District – 603203", "https://www.srmist.edu.in", "Engineering, nanotech, space (SRMSAT)"],
  ["Saveetha Institute of Medical & Technical Sciences", "SIMATS Chennai", "Chennai", "Tamil Nadu", "Poonamallee High Road, Velappanchavadi, Chennai – 600077", "https://saveetha.com", "Dental & medical sciences"],
  ["Thapar Institute of Engineering & Technology", "Thapar Patiala", "Patiala", "Punjab", "Bhadson Road, Patiala – 147004", "https://www.thapar.edu", "Engineering, biotech, energy"],
  ["Kalinga Institute of Industrial Technology (KIIT)", "KIIT Bhubaneswar", "Bhubaneswar", "Odisha", "Patia, Bhubaneswar – 751024", "https://kiit.ac.in", "Engineering, biotech, medicine"],
  ["Siksha 'O' Anusandhan (SOA)", "SOA Bhubaneswar", "Bhubaneswar", "Odisha", "Khandagiri Square, Bhubaneswar – 751030", "https://www.soa.ac.in", "Medicine, engineering, pharmacy"],
  ["Amity University", "Amity Noida", "Noida", "Uttar Pradesh", "Sector 125, Noida – 201313", "https://www.amity.edu", "Multidisciplinary, nanotech, biotech"],
  ["Chandigarh University", "Chandigarh Univ", "Mohali", "Punjab", "NH-05, Gharuan, Mohali – 140413", "https://www.cuchd.in", "Engineering, computing"],
  ["Lovely Professional University (LPU)", "LPU Phagwara", "Phagwara", "Punjab", "Jalandhar–Delhi G.T. Road, Phagwara – 144411", "https://www.lpu.in", "Multidisciplinary"],
  ["Shiv Nadar University", "Shiv Nadar Univ", "Greater Noida", "Uttar Pradesh", "NH-91, Tehsil Dadri, Gautam Buddha Nagar – 201314", "https://snu.edu.in", "Sciences, engineering"],
  ["Ashoka University", "Ashoka Univ", "Sonipat", "Haryana", "Plot No. 2, Rajiv Gandhi Education City, Sonipat – 131029", "https://www.ashoka.edu.in", "Biology, physics, social sciences"],
  ["SASTRA Deemed University", "SASTRA Thanjavur", "Thanjavur", "Tamil Nadu", "Tirumalaisamudram, Thanjavur – 613401", "https://www.sastra.edu", "Engineering, pharmacy, sciences"],
  ["Kalasalingam Academy of Research & Education", "Kalasalingam Univ", "Krishnankoil", "Tamil Nadu", "Anand Nagar, Krishnankoil, Srivilliputhur – 626126", "https://kalasalingam.ac.in", "Engineering, sciences"],
  ["Koneru Lakshmaiah Education Foundation (KL University)", "KL University", "Vijayawada", "Andhra Pradesh", "Green Fields, Vaddeswaram, Guntur District – 522302", "https://www.kluniversity.in", "Engineering, computing"],
  ["Sathyabama Institute of Science & Technology", "Sathyabama Chennai", "Chennai", "Tamil Nadu", "Jeppiaar Nagar, Rajiv Gandhi Salai, Chennai – 600119", "https://www.sathyabama.ac.in", "Engineering, space tech"],
  ["Symbiosis International University", "Symbiosis Pune", "Pune", "Maharashtra", "Lavale, Mulshi Taluka, Pune – 412115", "https://www.siu.edu.in", "Management, health, law"],
  ["Christ University", "Christ Bengaluru", "Bengaluru", "Karnataka", "Hosur Road, Bengaluru – 560029", "https://christuniversity.in", "Sciences, humanities, management"],
  ["UPES", "UPES Dehradun", "Dehradun", "Uttarakhand", "Energy Acres, Bidholi, Dehradun – 248007", "https://www.upes.ac.in", "Energy, petroleum, computing"],
  ["Graphic Era University", "Graphic Era", "Dehradun", "Uttarakhand", "566/6 Bell Road, Clement Town, Dehradun – 248002", "https://geu.ac.in", "Engineering, computing"],
  ["Dr. D.Y. Patil Vidyapeeth", "DY Patil Pune", "Pune", "Maharashtra", "Sant Tukaram Nagar, Pimpri, Pune – 411018", "https://dpu.edu.in", "Medical & health sciences"],
  ["Datta Meghe Institute of Higher Education & Research", "Datta Meghe Wardha", "Wardha", "Maharashtra", "Sawangi (Meghe), Wardha – 442001", "https://dmiher.edu.in", "Medical & health sciences"],
  ["SVKM's NMIMS", "NMIMS Mumbai", "Mumbai", "Maharashtra", "V.L. Mehta Road, Vile Parle (West), Mumbai – 400056", "https://www.nmims.edu", "Pharmacy, engineering, management"]
];
pvtData.forEach(d => addInst("Top Private", "Top Private Universities in Research", d[0], d[1], d[2], d[3], d[4], d[5], d[5] + "/careers", d[5] + "/phd-admissions", d[6]));

console.log(`Total institutions compiled: ${institutes.length}`);

// Write to data/institutes.json
const outDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'institutes.json'), JSON.stringify(institutes, null, 2), 'utf-8');
console.log(`Successfully generated data/institutes.json with ${institutes.length} institutions!`);
