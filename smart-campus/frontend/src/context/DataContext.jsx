import React, { createContext, useState, useEffect } from 'react';

export const DataContext = createContext();

// Bump this version number whenever you update the default student list or data schema.
// This will automatically clear old localStorage and reload fresh defaults for all users.
const DATA_VERSION = 'v3';

export const DataProvider = ({ children }) => {
    
    // Clear old data if the version has changed
    if (localStorage.getItem('sc_data_version') !== DATA_VERSION) {
        ['sc_companies', 'sc_notifs', 'sc_tests', 'sc_forum', 'sc_apps', 'sc_students', 'sc_mock_tests', 'sc_test_results'].forEach(k => localStorage.removeItem(k));
        localStorage.setItem('sc_data_version', DATA_VERSION);
    }

    // Helper function to initialize state from localStorage or default
    const initData = (key, defaultVal) => {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultVal;
    };

    const [companies, setCompanies] = useState(() => initData('sc_companies', [
        { id: 1, name: 'Infosys', role: 'System Engineer', eligibility: '65%', salary: '3.6 LPA', driveDate: '2024-10-24', status: 'Active', applicationDeadline: '2024-10-20T23:59', description: 'Global leader in next-generation digital services.', rounds: 'Aptitude,Technical,HR' },
        { id: 2, name: 'TCS', role: 'Ninja Developer', eligibility: '60%', salary: '3.36 LPA', driveDate: '2024-11-02', status: 'Active', applicationDeadline: '2024-10-30T23:59', description: 'IT services, consulting and business solutions organization.', rounds: 'Aptitude,Technical,HR' },
        { id: 3, name: 'Wipro', role: 'Elite Candidate', eligibility: '60%', salary: '3.5 LPA', driveDate: '2024-11-15', status: 'Active', applicationDeadline: '2024-11-10T23:59', description: 'Leading technology services and consulting company.', rounds: 'Aptitude,Technical,HR' }
    ]));
    
    const [notifications, setNotifications] = useState(() => initData('sc_notifs', [
        { id: 1, title: 'Welcome to PrepNPlace!', description: 'Track your placement journey here.', type: 'Info', recipientId: null, date: new Date().toISOString(), read: false, responses: {} }
    ]));
    
    // Helper to push a notification
    const pushNotification = (title, description, type = 'Info', recipientId = null) => {
        const newNotif = {
            id: Date.now(),
            title,
            description,
            type,
            recipientId,
            date: new Date().toISOString(),
            read: false,
            responses: {}
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const [tests, setTests] = useState(() => initData('sc_tests', [
        { id: 1, title: 'Infosys Aptitude Test', type: 'Quiz', company: 'Infosys', duration: 30, questions: [
            { q: 'What is 5 + 7?', options: ['10', '11', '12', '13'], answer: '12' },
            { q: 'Which data structure uses LIFO?', options: ['Queue', 'Stack', 'Tree', 'Graph'], answer: 'Stack' }
        ]},
        { id: 2, title: 'TCS Coding Round', type: 'Coding', company: 'TCS', duration: 45, questions: [
            { problemStatement: 'Write a program to reverse a string.', boilerplateCode: 'function reverseString(str) {\n  // write code here \n}' }
        ]}
    ]));
    
    const [discussions, setDiscussions] = useState(() => initData('sc_forum', [
        { id: 1, title: 'TCS Technical Interview Experience', content: 'They asked mostly oops and dbms.', author: 'student1@prepnplace.com', upvotes: [], comments: [] }
    ]));
    
    const [applications, setApplications] = useState(() => initData('sc_apps', [
        { id: 1, studentId: 'student1', companyId: 1, 
          rounds: [
              { name: 'Aptitude', status: 'Cleared', reason: '' },
              { name: 'Technical', status: 'Pending', reason: '' },
              { name: 'HR', status: 'Pending', reason: '' }
          ],
          finalStatus: 'In Progress'
        }
    ]));

    const [students, setStudents] = useState(() => initData('sc_students', [
        { id: '25MCR001', name: 'ABINAYA M', dept: 'MCA', section: 'A', cgpa: '7.79', phone: '8122421566', email: 'abinayam.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/abinaya4', github: 'https://github.com/ABINAYAM003', leetcode: 'https://leetcode.com/profile/', skills: [] },
        { id: '25MCR002', name: 'ABINAYA S', dept: 'MCA', section: 'A', cgpa: '8.88', phone: '9994780198', email: 'abinayas.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/abisaravanan198', github: 'https://github.com/Abinaya198', leetcode: 'https://leetcode.com/u/Abinaya198/', skills: [] },
        { id: '25MCR003', name: 'ABIRADHIE P V', dept: 'MCA', section: 'A', cgpa: '8.88', phone: '9751761617', email: 'abiradhiepv.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/abiradhie-venkateshwaran-77860b26b', github: 'https://github.com/Abiradhie', leetcode: 'https://leetcode.com/u/Abiradhie/', skills: [] },
        { id: '25MCR004', name: 'ABIRAMI J', dept: 'MCA', section: 'A', cgpa: '7.88', phone: '8870736985', email: 'abiramij.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/abirami-jeyakumar-611460267', github: 'https://github.com/Abirami-jeyakumar', leetcode: 'https://leetcode.com/u/Abirami_Jeyakumar/', skills: [] },
        { id: '25MCR005', name: 'ABITHA A', dept: 'MCA', section: 'A', cgpa: '8.42', phone: '7418895204', email: 'abithaa.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/abitha-a-580555293', github: 'https://github.com/Abitha-22', leetcode: 'https://leetcode.com/u/Abitha_22/', skills: [] },
        { id: '25MCR006', name: 'ADHITHYA N', dept: 'MCA', section: 'A', cgpa: '7.38', phone: '9629384119', email: 'adhithyan.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/adhithya-n-9629384119lp', github: 'https://github.com/ADHITHYA-010424', leetcode: 'https://leetcode.com/u/5iNqDGIrPx/', skills: [] },
        { id: '25MCR007', name: 'AISHWARYA R', dept: 'MCA', section: 'A', cgpa: '9.71', phone: '8870797193', email: 'aishwaryar.25mca@kongu.edu', linkedin: '', github: 'https://github.com/Aishwarya-Techhub', leetcode: '', skills: [] },
        { id: '25MCR008', name: 'ANIES FATHIMA I', dept: 'MCA', section: 'A', cgpa: '5', phone: '8807892749', email: 'aniesfathimai.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/anies-fathima-i-208512389', github: 'https://github.com/aniesfathima05', leetcode: 'https://leetcode.com/u/4SihC5AigA/', skills: [] },
        { id: '25MCR009', name: 'ANUSUYA DEVI M', dept: 'MCA', section: 'A', cgpa: '8.42', phone: '9342778668', email: 'anusuyadevim.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/anusuya-devi-m-', github: 'https://github.com/anusiyamanikandan851-blip', leetcode: 'https://leetcode.com/u/Anusuya_devi/', skills: [] },
        { id: '25MCR010', name: 'ARAVIND KANNA V', dept: 'MCA', section: 'A', cgpa: '7.83', phone: '6383576850', email: 'aravindkannav.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/aravind-kanna-90261626b', github: 'https://github.com/aravindkanna001', leetcode: 'https://leetcode.com/u/user6248a/', skills: [] },
        { id: '25MCR011', name: 'ARUNVEL R', dept: 'MCA', section: 'A', cgpa: '', phone: '', email: 'arunvelr.25mca@kongu.edu', linkedin: '', github: 'https://github.com/Arunvelsindhu', leetcode: '', skills: [] },
        { id: '25MCR013', name: 'BARANETHARAN P', dept: 'MCA', section: 'A', cgpa: '', phone: '6383655919', email: 'baranetharanp.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/baranetharan-p-barane', github: 'https://github.com/Baranetharan-ds', leetcode: 'https://leetcode.com/u/baranetharan/', skills: [] },
        { id: '25MCR014', name: 'BHAWIN A B', dept: 'MCA', section: 'A', cgpa: '8.33', phone: '9150030540', email: 'bhawinab.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/bhawin-a-b', github: 'https://github.com/bhawinab', leetcode: 'https://leetcode.com/u/bhawin____/', skills: [] },
        { id: '25MCR015', name: 'BHUVANESH L', dept: 'MCA', section: 'A', cgpa: '7.46', phone: '9629426779', email: 'bhuvaneshl.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/bhuvanesh-l-0715b926b', github: 'https://github.com/lbhuvaneshbhuvi-pixel', leetcode: 'https://leetcode.com/u/user9242iz/', skills: [] },
        { id: '25MCR017', name: 'CHARSHIKA M', dept: 'MCA', section: 'A', cgpa: '8.01', phone: '9363467469', email: 'charshikam.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/charshika-maran-bb349727a', github: 'https://github.com/CharshikaMaran', leetcode: 'https://leetcode.com/u/charshikamaran/', skills: [] },
        { id: '25MCR018', name: 'CHITTESH S', dept: 'MCA', section: 'A', cgpa: '', phone: '', email: 'chitteshs.25mca@kongu.edu', linkedin: '', github: 'https://github.com/chitteshs2004', leetcode: '', skills: [] },
        { id: '25MCR021', name: 'DHAYANANTH R R', dept: 'MCA', section: 'A', cgpa: '7.46', phone: '7845123053', email: 'dhayananthrr.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/dhayananth-r-r-536169292', github: 'https://github.com/dhayananth2709', leetcode: 'https://leetcode.com/u/Dhayananth_R_R/', skills: [] },
        { id: '25MCR022', name: 'DHUSYANTH GHAGEN SINGH M', dept: 'MCA', section: 'A', cgpa: '7.96', phone: '8248625980', email: 'dhusyanthghagensinghm.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/dhusyanth-ghagen-singh', github: 'https://github.com/DhusyanthGhagenSingh004', leetcode: 'https://leetcode.com/u/Dhusyanthghagensingh1912/', skills: [] },
        { id: '25MCR023', name: 'DINESH KUMAR V', dept: 'MCA', section: 'A', cgpa: '7.83', phone: '8668034676', email: 'dineshkumarv.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/dinesh-kumar-v-664448295', github: 'https://github.com/StudentDinesh', leetcode: 'https://leetcode.com/u/dkmca/', skills: [] },
        { id: '25MCR024', name: 'DINESH V', dept: 'MCA', section: 'A', cgpa: '7.5', phone: '9345520515', email: 'dineshv.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/v-dinesh-55a809265', github: 'https://github.com/vdinesh0912/Database_learn', leetcode: 'https://leetcode.com/u/dinesh_jr/', skills: [] },
        { id: '25MCR025', name: 'DURAIMURUGAN K', dept: 'MCA', section: 'A', cgpa: '5', phone: '6382473806', email: 'duraimurugank.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/durai-murugan-b0353a292', github: 'https://github.com/duraimurugank25mca-dotcom', leetcode: 'https://leetcode.com/u/durai_04/', skills: [] },
        { id: '25MCR026', name: 'GAYATHRI V', dept: 'MCA', section: 'A', cgpa: '7.63', phone: '9790087453', email: 'gayathriv.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/gayathri-v-1379333a2/', github: 'https://github.com/gayathri198', leetcode: 'https://leetcode.com/u/gayathrichitra/', skills: [] },
        { id: '25MCR027', name: 'GOKUL S', dept: 'MCA', section: 'A', cgpa: '7.21', phone: '6383445439', email: 'gokuls.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/gokul-s-863545292', github: 'https://github.com/gokulgms638344-rgb', leetcode: 'https://leetcode.com/u/Gokul031/', skills: [] },
        { id: '25MCR028', name: 'GOPIKA B', dept: 'MCA', section: 'A', cgpa: '9.04', phone: '9342424172', email: 'gopikab.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/gopika-b-191620280', github: 'https://github.com/subagopi', leetcode: 'https://leetcode.com/u/GOPIKA55/', skills: [] },
        { id: '25MCR029', name: 'GOWRIPRIYA V', dept: 'MCA', section: 'A', cgpa: '8.29', phone: '8111084807', email: 'gowripriyav.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/gowripriya-v-455b94222', github: 'https://github.com/Gowri-Hubio', leetcode: 'https://leetcode.com/u/Gowripriya16/', skills: [] },
        { id: '25MCR030', name: 'GOWTHAM B', dept: 'MCA', section: 'A', cgpa: '8.17', phone: '7339698020', email: 'gowthamb.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/gowtham-krishnan-36aba6266', github: 'https://github.com/Littlekrish003', leetcode: 'https://leetcode.com/u/Gowthamkrish5/', skills: [] },
        { id: '25MCR032', name: 'HARI SHANKAR L K', dept: 'MCA', section: 'A', cgpa: '5', phone: '8220000081', email: 'harishankarlk.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/harishankarlk', github: 'https://github.com/Hari07102004', leetcode: 'https://leetcode.com/u/harishankar99655/', skills: [] },
        { id: '25MCR033', name: 'HARINI P', dept: 'MCA', section: 'A', cgpa: '8.29', phone: '6383371206', email: 'harinip.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/harini-palanisamy-a6a134274', github: 'https://github.com/Harini-096', leetcode: 'https://leetcode.com/u/Harini-096/', skills: [] },
        { id: '25MCR034', name: 'HARINI S', dept: 'MCA', section: 'A', cgpa: '8.67', phone: '9342743614', email: 'harinis.25mca@kongu.edu', linkedin: 'https://linkedin.com/in/harini-s-a5a977268/', github: 'https://github.com/harinii213', leetcode: 'https://leetcode.com/u/hariniselvakumar03/', skills: [] },
        { id: '25MCR035', name: 'HEMAVARNI J B', dept: 'MCA', section: 'A', cgpa: '7.79', phone: '9443030099', email: 'hemavarnijb.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/hema-varni-078943380', github: 'https://github.com/Hemavarni11', leetcode: 'https://leetcode.com/u/Hemavarni_11/', skills: [] },
        { id: '25MCR036', name: 'ILAMURUGHAN K', dept: 'MCA', section: 'A', cgpa: '8.33', phone: '6383779798', email: 'ilamurughank.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/ilamurughan-k-388', github: 'https://github.com/ilamurughanK', leetcode: 'https://leetcode.com/u/ilamurughank/', skills: [] },
        { id: '25MCR037', name: 'INDUMATHI K', dept: 'MCA', section: 'A', cgpa: '7.42', phone: '9787734039', email: 'indumathik.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/indumathi-k-6986ab26b', github: 'https://github.com/iindumathik', leetcode: 'https://leetcode.com/u/indumathi_07/', skills: [] },
        { id: '25MCR038', name: 'JASMITHA S', dept: 'MCA', section: 'A', cgpa: '8.83', phone: '6381700632', email: 'jasmithas.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/jasmitha-s-1b070a26b', github: 'https://github.com/Jasmitha-s', leetcode: '', skills: [] },
        { id: '25MCR039', name: 'JAYASHALINI V', dept: 'MCA', section: 'A', cgpa: '7.92', phone: '8778652022', email: 'jayashaliniv.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/jayashalini-v-008119389', github: 'https://github.com/ShaliniVivekanandan', leetcode: '', skills: [] },
        { id: '25MCR040', name: 'JAYAVARSHINIE V S', dept: 'MCA', section: 'A', cgpa: '8.4', phone: '6381713695', email: 'jayavarshinievs.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/jayavarshinie-v-s', github: 'https://github.com/JAYAVARSHINIEVS04/jaya', leetcode: 'https://leetcode.com/u/JAYAVARSHINIE_V_S/', skills: [] },
        { id: '25MCR041', name: 'JEEVANANDHAM PERUMAL', dept: 'MCA', section: 'A', cgpa: '8.17', phone: '9566401912', email: 'jeevanandhamperumal.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/jeeva-kpj-798b3a305', github: 'https://github.com/jeevanandhamperumal25mca', leetcode: 'https://leetcode.com/u/user6455s/', skills: [] },
        { id: '25MCR042', name: 'KABISA P', dept: 'MCA', section: 'A', cgpa: '7.79', phone: '6381356728', email: 'kabisap.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/kabisa-p', github: 'https://github.com/Kabisa508', leetcode: 'https://leetcode.com/u/Kabisa/', skills: [] },
        { id: '25MCR043', name: 'KARPAGAM R', dept: 'MCA', section: 'A', cgpa: '8.71', phone: '8524859308', email: 'karpagamr.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/karpagamramesh/', github: 'https://github.com/vkarpagamramesh-coder', leetcode: 'https://leetcode.com/u/karpagamrv/', skills: [] },
        { id: '25MCR044', name: 'KAVINESH S R', dept: 'MCA', section: 'A', cgpa: '8.26', phone: '8681088788', email: 'kavineshsr.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/kavineshsr', github: 'https://github.com/Kavinjr1612', leetcode: 'https://leetcode.com/u/KaviyaShree123/', skills: [] },
        { id: '25MCR045', name: 'KAVIPRABU S', dept: 'MCA', section: 'A', cgpa: '7.3', phone: '9360415676', email: 'kaviprabus.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/kavi-prabu-86112928a', github: 'https://github.com/kaviprabu-s', leetcode: 'https://leetcode.com/u/kaviprabu4494/', skills: [] },
        { id: '25MCR046', name: 'KAVIYAPRIYA K', dept: 'MCA', section: 'A', cgpa: '9.42', phone: '9788625523', email: 'kaviyapriyak.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/kaviyapriya-k-8b400b26b', github: 'https://github.com/Kaviyapriya-12', leetcode: 'https://leetcode.com/u/Kaviyapriya_K/', skills: [] },
        { id: '25MCR047', name: 'KAVIYASHREE G', dept: 'MCA', section: 'A', cgpa: '', phone: '9363716747', email: 'kaviyashreeg.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/kaviya-shree', github: 'https://github.com/kaviyashree11', leetcode: 'https://leetcode.com/u/KaviyaShree123/', skills: [] },
        { id: '25MCR048', name: 'KAVIYAVARSHINI J', dept: 'MCA', section: 'A', cgpa: '9.17', phone: '9965640004', email: 'kaviyavarshinij.25mca@kongu.edu', linkedin: 'https://linkedin.com/in/kaviyavarshinij29', github: 'https://github.com/kaviyavarshini29', leetcode: 'https://leetcode.com/KaviyavarshiniJ', skills: [] },
        { id: '25MCR049', name: 'KIRUTHIKA N T', dept: 'MCA', section: 'A', cgpa: '8.25', phone: '9842082432', email: 'kiruthikant.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/kiruthika-thangavel-089996388', github: 'https://github.com/Kiruthika5511', leetcode: 'https://leetcode.com/u/Kiruthika511/', skills: [] },
        { id: '25MCR050', name: 'KRITHIK M S', dept: 'MCA', section: 'A', cgpa: '7.63', phone: '8838261676', email: 'krithikms.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/krithik-mohanasundaram', github: 'https://github.com/krithikms7', leetcode: '', skills: [] },
        { id: '25MCR051', name: 'KRUPA N S', dept: 'MCA', section: 'A', cgpa: '9', phone: '8344447735', email: 'krupans.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/krupa-n-s-70861426b', github: 'https://github.com/krupans', leetcode: 'https://leetcode.com/u/krupa_NS/', skills: [] },
        { id: '25MCR053', name: 'LALITH VISHNU P', dept: 'MCA', section: 'A', cgpa: '8.08', phone: '8220457799', email: 'lalithvishnup.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/lalith-vishnu-478199280', github: 'https://github.com/vishnu1046', leetcode: 'https://leetcode.com/u/LalithMCA/', skills: [] },
        { id: '25MCR054', name: 'LOGESH KUMAR S', dept: 'MCA', section: 'A', cgpa: '7.8', phone: '9715247748', email: 'logeshkumars.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/logesh-kumar-s-0b2a0b27b', github: 'https://github.com/logesh911', leetcode: 'https://leetcode.com/u/Logesh911/', skills: [] },
        { id: '25MCR055', name: 'LOGESH V', dept: 'MCA', section: 'A', cgpa: '7.88', phone: '6381975196', email: 'logeshv.25mca@kongu.edu', linkedin: '', github: 'https://github.com/LogeshVisvanathan', leetcode: '', skills: [] },
        { id: '25MCR056', name: 'LOGESH V', dept: 'MCA', section: 'A', cgpa: '8.42', phone: '7402545155', email: 'vlogesh.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/logesh-v-600077321', github: 'https://github.com/loges-v', leetcode: 'https://leetcode.com/u/Logesv21/', skills: [] },
        { id: '25MCR057', name: 'LOGITH S', dept: 'MCA', section: 'A', cgpa: '7.63', phone: '9500965667', email: 'logiths.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/logith-s-6b21b2384', github: 'https://github.com/Logith03', leetcode: 'https://leetcode.com/u/logith14s/', skills: [] },
        { id: '25MCR058', name: 'LOHESH SHANKAR S', dept: 'MCA', section: 'A', cgpa: '7.38', phone: '7806900386', email: 'loheshshankars.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/lohesh-shankar-658346282/', github: 'https://github.com/Loheshshankar6271', leetcode: 'https://leetcode.com/u/LoheshShankar_S/', skills: [] },
        { id: '25MCR059', name: 'MADHUMITHA T R', dept: 'MCA', section: 'A', cgpa: '8.42', phone: '9092858320', email: 'madhumithatr.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/madhumitha-ramkumar', github: 'https://github.com/Madhumitharamkumarr', leetcode: 'https://leetcode.com/u/madhuramkumar/', skills: [] },
        { id: '25MCR060', name: 'MADHUMITHA V', dept: 'MCA', section: 'A', cgpa: '8.96', phone: '9361483586', email: 'madhumithav.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/madhumitha-v06', github: 'https://github.com/Madhumitha01-V', leetcode: '', skills: [] },
        { id: '25MCR061', name: 'MANISHA V', dept: 'MCA', section: 'A', cgpa: '8.17', phone: '8807171021', email: 'manishav.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/manisha-v-6639612b6', github: 'https://github.com/Manishakrishna2004', leetcode: 'https://leetcode.com/u/mvc3kaFPEX/', skills: [] },
        { id: '25MCR062', name: 'MANJARIKA B S', dept: 'MCA', section: 'A', cgpa: '9.13', phone: '9095265472', email: 'manjarikabs.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/manjarika-b-s-29450026b', github: 'https://github.com/Manjarika', leetcode: 'https://leetcode.com/u/manojkumar2114/', skills: [] },
        { id: '25MCR063', name: 'MANOJ KUMAR S', dept: 'MCA', section: 'A', cgpa: '', phone: '9698670731', email: 'manojkumars.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/manoj-kumar-550096292', github: 'https://github.com/manojs832004-source', leetcode: '', skills: [] },
        { id: '25MCR064', name: 'MARSHEYAH A', dept: 'MCA', section: 'A', cgpa: '8.04', phone: '8248166972', email: 'marsheyaha.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/marsheyah-antonyraj-768943380', github: 'https://github.com/marsheyah', leetcode: 'https://leetcode.com/u/Marsheyah4/', skills: [] },
        { id: '25MCR065', name: 'MOHANAPRIYA V', dept: 'MCA', section: 'B', cgpa: '8.29', phone: '8428323312', email: 'mohanapriyav.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/mohanapriya-v-5a87a6316/', github: 'https://github.com/mohanapriyaveerasamy11-del', leetcode: 'https://leetcode.com/u/MOHANAPRIYA_VEERASAMY/', skills: [] },
        { id: '25MCR067', name: 'MOULIDHARAN P', dept: 'MCA', section: 'B', cgpa: '8.04', phone: '7904372833', email: 'moulidharanp.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/moulidharan-p-82371526b', github: 'https://github.com/mouligem', leetcode: 'https://leetcode.com/u/user6705Ty/', skills: [] },
        { id: '25MCR069', name: 'NAVEEN K', dept: 'MCA', section: 'B', cgpa: '7.46', phone: '9025807847', email: 'naveenk.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/naveen-k-8379a5281', github: 'https://github.com/Naveen-17112004', leetcode: 'https://leetcode.com/u/naveenk25mca/', skills: [] },
        { id: '25MCR070', name: 'NAVEEN P', dept: 'MCA', section: 'B', cgpa: '', phone: '', email: 'naveenp.25mca@kongu.edu', linkedin: '', github: '', leetcode: '', skills: [] },
        { id: '25MCR071', name: 'NAVEENA P', dept: 'MCA', section: 'B', cgpa: '7.25', phone: '8667264156', email: 'naveenap.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/naveena-p-a48944293', github: 'https://github.com/naveenanavi23004-hub', leetcode: 'https://leetcode.com/u/Naveena4', skills: [] },
        { id: '25MCR072', name: 'NAVINKUMAR M', dept: 'MCA', section: 'B', cgpa: '', phone: '', email: 'navinkumarm.25mca@kongu.edu', linkedin: '', github: '', leetcode: '', skills: [] },
        { id: '25MCR074', name: 'NISHANTH K J', dept: 'MCA', section: 'B', cgpa: '', phone: '', email: 'nishanthkj.25mca@kongu.edu', linkedin: '', github: '', leetcode: '', skills: [] },
        { id: '25MCR075', name: 'NISVANTH S', dept: 'MCA', section: 'B', cgpa: '9.17', phone: '6383567950', email: 'nisvanths.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/nisvanth-s-5346aa26b', github: 'https://github.com/nisvanth6383-star', leetcode: 'https://leetcode.com/u/Nisvanth__1/', skills: [] },
        { id: '25MCR076', name: 'NITHISH KUMAR C', dept: 'MCA', section: 'B', cgpa: '8.63', phone: '8675955262', email: 'nithishkumarc.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/nithish-kumar-a4a77b329/', github: 'https://github.com/nithish309', leetcode: 'https://leetcode.com/u/nithishck/', skills: [] },
        { id: '25MCR077', name: 'NIVETHA V', dept: 'MCA', section: 'B', cgpa: '6.67', phone: '9025840552', email: 'nivethav.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/nivetha-vijayakumar', github: 'https://github.com/Nivietha-2005', leetcode: 'https://leetcode.com/Nivetha_latha/', skills: [] },
        { id: '25MCR078', name: 'OVIYA R', dept: 'MCA', section: 'B', cgpa: '', phone: '6369796661', email: 'oviyar.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/oviya-ravi-842255382', github: 'https://github.com/oviyaravi14', leetcode: '', skills: [] },
        { id: '25MCR079', name: 'PAVITHRAA S', dept: 'MCA', section: 'B', cgpa: '', phone: '', email: 'pavithraas.25mca@kongu.edu', linkedin: '', github: '', leetcode: '', skills: [] },
        { id: '25MCR080', name: 'PON ABARNA J', dept: 'MCA', section: 'B', cgpa: '8.92', phone: '9994842339', email: 'ponabarnaj.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/ponabarna-j-74561526b/', github: 'https://github.com/Ponabarnaa', leetcode: 'https://leetcode.com/u/Pon_Abarna/', skills: [] },
        { id: '25MCR081', name: 'POOJA T J', dept: 'MCA', section: 'B', cgpa: '8.63', phone: '8344953303', email: 'poojatj.25mca@kongu.edu', linkedin: 'https://linkedin.com/in/pooja-t-j-9ba818250', github: 'https://github.com/pooja032005', leetcode: 'https://leetcode.com/u/poojatj/', skills: [] },
        { id: '25MCR082', name: 'PRADEEP P', dept: 'MCA', section: 'B', cgpa: '7.88', phone: '8825705423', email: 'pradeepp.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/pradeep-palanisamy-707375246/', github: 'https://github.com/pradeep-palanisamy', leetcode: 'https://leetcode.com/u/pradeeppalanisamy02/', skills: [] },
        { id: '25MCR083', name: 'PRAGATHESHWARAN R', dept: 'MCA', section: 'B', cgpa: '5', phone: '9786347745', email: 'pragatheshwaranr.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/pragatheshwaran-r', github: 'https://github.com/Pragathes-05', leetcode: 'https://leetcode.com/u/pragathes/', skills: [] },
        { id: '25MCR084', name: 'PRANESH R', dept: 'MCA', section: 'B', cgpa: '', phone: '', email: 'praneshr.25mca@kongu.edu', linkedin: '', github: '', leetcode: '', skills: [] },
        { id: '25MCR085', name: 'PRATYUSH S', dept: 'MCA', section: 'B', cgpa: '8.13', phone: '9488665182', email: 'pratyushs.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/pratyush-s-75771426b', github: 'https://github.com/pratyushsmp', leetcode: 'https://leetcode.com/u/Pratyushscripts/', skills: [] },
        { id: '25MCR086', name: 'RAGUVARSHAN K', dept: 'MCA', section: 'B', cgpa: '6.88', phone: '9345565855', email: 'raguvarshank.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/raguvarshan-k-aa869a316', github: 'https://github.com/RAGUVARSHAN', leetcode: 'https://leetcode.com/u/RAGU_VARSHAN/', skills: [] },
        { id: '25MCR087', name: 'RAHUL I', dept: 'MCA', section: 'B', cgpa: '5', phone: '9080081210', email: 'rahuli.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/rahul-i-429b89247/', github: 'https://github.com/rahul-at-dev', leetcode: 'https://leetcode.com/u/Rahul_lc04/', skills: [] },
        { id: '25MCR088', name: 'RAHUL M', dept: 'MCA', section: 'B', cgpa: '6.1', phone: '9952802101', email: 'rahulm.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/rahul-m-5ba3843a2', github: 'https://github.com/RahulM017', leetcode: '', skills: [] },
        { id: '25MCR089', name: 'RAJA G', dept: 'MCA', section: 'B', cgpa: '7.42', phone: '9342434552', email: 'rajag.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/raja-g-699a9a326', github: 'https://github.com/Raja4552G', leetcode: 'https://leetcode.com/u/IH6wYAaebR/', skills: [] },
        { id: '25MCR090', name: 'RANJITH S R', dept: 'MCA', section: 'B', cgpa: '7.63', phone: '7695927917', email: 'ranjithsr.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/ranjith-sr-13a87a333', github: 'https://github.com/ranjith-sr22', leetcode: 'https://leetcode.com/u/Ranjith41/', skills: [] },
        { id: '25MCR091', name: 'RAVIKUMAR P', dept: 'MCA', section: 'B', cgpa: '7.63', phone: '8344497401', email: 'ravikumarp.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/ravikumar-p-4a389237b/', github: 'https://github.com/ravikumarmca64', leetcode: 'https://leetcode.com/u/Ravikumar_lc/', skills: [] },
        { id: '25MCR092', name: 'RESHMA G', dept: 'MCA', section: 'B', cgpa: '9.13', phone: '9361613049', email: 'reshmag.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/reshma-govindaraj-b96a41291', github: 'https://github.com/ReshmaGovindaraj', leetcode: 'https://leetcode.com/u/ReshmaGovindaraj/', skills: [] },
        { id: '25MCR093', name: 'ROHIT S R', dept: 'MCA', section: 'B', cgpa: '', phone: '', email: 'rohitsr.25mca@kongu.edu', linkedin: '', github: '', leetcode: '', skills: [] },
        { id: '25MCR094', name: 'RUCHITHA T U', dept: 'MCA', section: 'B', cgpa: '8.75', phone: '6374778071', email: 'ruchithatu.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/ruchitha-t-u/', github: 'https://github.com/ruchithaudayakumar', leetcode: 'https://leetcode.com/u/ruchithaudayakumar/', skills: [] },
        { id: '25MCR095', name: 'RUTHRA MOORTHI M', dept: 'MCA', section: 'B', cgpa: '', phone: '6374604336', email: 'ruthramoorthim.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/ruthra-moorthi-m-88b263281', github: 'https://github.com/ruthramoorthim4-alt', leetcode: 'https://leetcode.com/u/RuthramoorthiM67/', skills: [] },
        { id: '25MCR096', name: 'SAGANA V S', dept: 'MCA', section: 'B', cgpa: '9.75', phone: '9894419500', email: 'saganavs.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/sagana-venkateswaran-481440282', github: 'https://github.com/sahanavenkateshwaran', leetcode: '', skills: [] },
        { id: '25MCR097', name: 'SAKTHI BHARATHI G', dept: 'MCA', section: 'B', cgpa: '8.75', phone: '9043276895', email: 'sakthibharathig.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/sakthibharathig', github: 'https://github.com/sakthibharathig', leetcode: 'https://leetcode.com/u/sakthibharathig/', skills: [] },
        { id: '25MCR098', name: 'SANDHIYA A', dept: 'MCA', section: 'B', cgpa: '8.33', phone: '9363547093', email: 'sandhiyaa.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/sandhiya-a', github: 'https://github.com/sandhiyaa25mca', leetcode: 'https://leetcode.com/u/Sandhiya_0801/', skills: [] },
        { id: '25MCR099', name: 'SANTHIYA U', dept: 'MCA', section: 'B', cgpa: '7.54', phone: '9360512339', email: 'santhiyau.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/santhiya-u/', github: 'https://github.com/santhiya-udhaya', leetcode: 'https://leetcode.com/u/Santhiya488/', skills: [] },
        { id: '25MCR100', name: 'SARUMATHI A', dept: 'MCA', section: 'B', cgpa: '7.54', phone: '6374184208', email: 'sarumathia.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/sarumathi-a', github: 'https://github.com/sarumathi857', leetcode: '', skills: [] },
        { id: '25MCR101', name: 'SARVESH R', dept: 'MCA', section: 'B', cgpa: '8.88', phone: '9842308011', email: 'sarveshr.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/sarvesh-r-69561326b', github: 'https://github.com/sarveshr23', leetcode: 'https://leetcode.com/u/user2987wP/', skills: [] },
        { id: '25MCR102', name: 'SELLAKUMAR P', dept: 'MCA', section: 'B', cgpa: '7.21', phone: '9361779636', email: 'Sellakumarp.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/sellakumar-p-1b33b6292', github: 'https://github.com/sellakumarkec-glitch', leetcode: 'https://leetcode.com/u/sellakumar3/', skills: [] },
        { id: '25MCR103', name: 'SELVA VIKASH M P', dept: 'MCA', section: 'B', cgpa: '', phone: '', email: 'selvavikashmp.25mca@kongu.edu', linkedin: '', github: '', leetcode: '', skills: [] },
        { id: '25MCR104', name: 'SHARMILA R', dept: 'MCA', section: 'B', cgpa: '9.54', phone: '9865378866', email: 'sharmilar.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/sharmila1912/', github: 'https://github.com/Sharmila-1912', leetcode: 'https://leetcode.com/u/Sharmila_R/', skills: [] },
        { id: '25MCR105', name: 'SHARU NAVYA S', dept: 'MCA', section: 'B', cgpa: '7.88', phone: '9940459654', email: 'sharunavyas.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/sharu-navya-b09448355/', github: 'https://github.com/sharunavya8026', leetcode: 'https://leetcode.com/u/Sharunavya/', skills: [] },
        { id: '25MCR106', name: 'SIBIDHARAN S', dept: 'MCA', section: 'B', cgpa: '', phone: '', email: 'sibidharans.25mca@kongu.edu', linkedin: '', github: '', leetcode: '', skills: [] },
        { id: '25MCR107', name: 'SIVA DHARSHINI S', dept: 'MCA', section: 'B', cgpa: '7.92', phone: '9842166932', email: 'sivadharshinis.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/siva-dharshini-s-7946b6385', github: 'https://github.com/sivadharshini0312-pixel', leetcode: 'https://leetcode.com/u/Siva_Dharshini_S/', skills: [] },
        { id: '25MCR108', name: 'SIVAPRASATH R', dept: 'MCA', section: 'B', cgpa: '', phone: '', email: 'sivaprasathr.25mca@kongu.edu', linkedin: '', github: '', leetcode: '', skills: [] },
        { id: '25MCR109', name: 'SIVASHANMUGAM S', dept: 'MCA', section: 'B', cgpa: '7.54', phone: '9677714363', email: 'sivashanmugams.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/sivashanmugam-s-33bb3b36a', github: 'https://github.com/Sivashanmugm', leetcode: 'https://leetcode.com/u/Sivashanmugam_S/', skills: [] },
        { id: '25MCR110', name: 'SRIKANTH K', dept: 'MCA', section: 'B', cgpa: '', phone: '6380569399', email: 'srikanthk.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/srikanth-k-971', github: 'https://github.com/srikanthkz', leetcode: 'https://leetcode.com/u/srikanthk1135/', skills: [] },
        { id: '25MCR111', name: 'SRIMATHI R', dept: 'MCA', section: 'B', cgpa: '7.2', phone: '9344855729', email: 'srimathir.25mca@kongu.edu', linkedin: 'https://in.linkedin.com/in/srimathi-r-9a4a103a1', github: 'https://github.com/srimathi27', leetcode: 'https://leetcode.com/u/Srimathir_27/', skills: [] },
        { id: '25MCR112', name: 'SRIVAISHNAVI P', dept: 'MCA', section: 'B', cgpa: '7.36', phone: '9080914489', email: 'srivaishnavip.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/srivaisnavi-p-591670357', github: 'https://github.com/vaisusri03', leetcode: 'https://leetcode.com/u/vaisusri/', skills: [] },
        { id: '25MCR113', name: 'SUBASH R', dept: 'MCA', section: 'B', cgpa: '7.5', phone: '9360964855', email: 'subashr.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/subash-r-bb8757294', github: 'https://github.com/SubashRajendranMca', leetcode: 'https://leetcode.com/u/Subash-R-30/', skills: [] },
        { id: '25MCR114', name: 'SUBASRI D M', dept: 'MCA', section: 'B', cgpa: '7.92', phone: '9789220377', email: 'subasridm.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/subasri24/', github: 'https://github.com/subasridm25mca-debug', leetcode: 'https://leetcode.com/u/SubasriDhanasekaran/', skills: [] },
        { id: '25MCR115', name: 'SUJEETH P', dept: 'MCA', section: 'B', cgpa: '', phone: '', email: 'sujeethp.25mca@kongu.edu', linkedin: '', github: '', leetcode: '', skills: [] },
        { id: '25MCR116', name: 'SUJIT ROSHAN A C', dept: 'MCA', section: 'B', cgpa: '7.76', phone: '9597404822', email: 'sujitroshanac.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/sujit-roshan-a-c-307b02294', github: 'https://github.com/sujit-roshan143', leetcode: 'https://leetcode.com/u/Sujit_Roshan/', skills: [] },
        { id: '25MCR117', name: 'SUKEERTHI K', dept: 'MCA', section: 'B', cgpa: '9.13', phone: '6383173931', email: 'sukeerthik.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/sukeerthik23/', github: 'https://github.com/Sukeerthi23', leetcode: 'https://leetcode.com/u/Sukeerthi_23/', skills: [] },
        { id: '25MCR118', name: 'SWETHA S', dept: 'MCA', section: 'B', cgpa: '8.92', phone: '8903840228', email: 'swethas.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/swetha-s-b47486259', github: 'https://github.com/Swetha-SubramanianG', leetcode: 'https://leetcode.com/u/SwethaChitra//', skills: [] },
        { id: '25MCR119', name: 'UDHAYA R', dept: 'MCA', section: 'B', cgpa: '', phone: '', email: 'Udhayar.25mca@kongu.edu', linkedin: '', github: '', leetcode: '', skills: [] },
        { id: '25MCR120', name: 'VAISHNAVI N', dept: 'MCA', section: 'B', cgpa: '7.92', phone: '8148778794', email: 'vaishnavin.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/vaishnavi-n-08b479382', github: 'https://github.com/Vaishnavinagenthiran', leetcode: '', skills: [] },
        { id: '25MCR121', name: 'VEEBIN VARSHAN B', dept: 'MCA', section: 'B', cgpa: '7.79', phone: '9597079423', email: 'veebinvarshanb.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/veebinvarshan', github: 'https://github.com/veebinvarshan', leetcode: 'https://leetcode.com/u/veebinvarshan/', skills: [] },
        { id: '25MCR122', name: 'VENKATESH K', dept: 'MCA', section: 'B', cgpa: '7.79', phone: '8668166770', email: 'venkateshk.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/venkatesh-k-8113a03a2', github: 'https://github.com/venkatesh3661', leetcode: 'https://leetcode.com/u/venkatesh_55', skills: [] },
        { id: '25MCR123', name: 'VIBINIKHA E M', dept: 'MCA', section: 'B', cgpa: '9.17', phone: '', email: 'vibinikhaem.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/vibinikha-e-m-52010b270', github: '', leetcode: '', skills: [] },
        { id: '25MCR125', name: 'VIJAYALAKSHMI J', dept: 'MCA', section: 'B', cgpa: '', phone: '', email: 'Vijayalakshmij.25mca@kongu.edu', linkedin: '', github: '', leetcode: '', skills: [] },
        { id: '25MCR126', name: 'VISHALINI A', dept: 'MCA', section: 'B', cgpa: '7.83', phone: '8220164322', email: 'vishalinia.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/vishalini-a', github: 'https://github.com/dharshavishalini-stack', leetcode: 'https://leetcode.com/u/VishaliniA/', skills: [] },
        { id: '25MCR127', name: 'THIRUVENKATESH K', dept: 'MCA', section: 'B', cgpa: '5', phone: '8870625975', email: 'thiruvenkateshk.25mca@kongu.edu', linkedin: 'https://www.linkedin.com/in/thiruvenkatesh-k-b8371126b', github: 'https://github.com/ThiruvenkateshK', leetcode: 'https://leetcode.com/u/hoa7B4A65r/', skills: [] }
    ]));

    // mockTests: company-wise question banks created by admin from PDF or manually
    // Structure: [{ id, companyName, title, questions: [{id,question,options[],answer,type,difficulty}] }]
    const [mockTests, setMockTests] = useState(() => initData('sc_mock_tests', []));

    // testResults: scores per student per quiz
    // Structure: [{ id, studentId, testId, companyName, title, score, total, pct, date, type:'mcq'|'coding' }]
    const [testResults, setTestResults] = useState(() => initData('sc_test_results', []));

    // Sync state changes to localStorage
    useEffect(() => { localStorage.setItem('sc_companies',    JSON.stringify(companies));    }, [companies]);
    useEffect(() => { localStorage.setItem('sc_notifs',       JSON.stringify(notifications));}, [notifications]);
    useEffect(() => { localStorage.setItem('sc_tests',        JSON.stringify(tests));        }, [tests]);
    useEffect(() => { localStorage.setItem('sc_forum',        JSON.stringify(discussions));  }, [discussions]);
    useEffect(() => { localStorage.setItem('sc_apps',         JSON.stringify(applications)); }, [applications]);
    useEffect(() => { localStorage.setItem('sc_students',     JSON.stringify(students));     }, [students]);
    useEffect(() => { localStorage.setItem('sc_mock_tests',   JSON.stringify(mockTests));    }, [mockTests]);
    useEffect(() => { localStorage.setItem('sc_test_results', JSON.stringify(testResults));  }, [testResults]);

    return (
        <DataContext.Provider value={{
            companies, setCompanies,
            notifications, setNotifications,
            pushNotification,
            tests, setTests,
            discussions, setDiscussions,
            applications, setApplications,
            students, setStudents,
            mockTests, setMockTests,
            testResults, setTestResults,
        }}>
            {children}
        </DataContext.Provider>
    );
};
