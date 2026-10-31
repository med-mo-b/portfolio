/**
 * Timeline data for the About page
 * Contains career, education, research, and homelabbing events
 */

import type { TimelineEvent, BranchConfig } from '../types.js';

/**
 * Branch configurations for the git-style timeline
 */
export const BRANCHES: BranchConfig[] = [
    { id: 'main', label: 'Professional', labelDe: 'Beruflich', color: '#3b82f6', order: 0 },
    { id: 'education', label: 'Academic', labelDe: 'Akademisch', color: '#10b981', order: 1 },
    { id: 'research', label: 'Research', labelDe: 'Forschung', color: '#8b5cf6', order: 2 },
    { id: 'homelabbing', label: 'Personal', labelDe: 'Persönlich', color: '#f59e0b', order: 3 },
];

/**
 * Timeline events sorted by date (newest first)
 */
export const TIMELINE_DATA: TimelineEvent[] = [
    {
        id: 'osapiens-aipe',
        date: 'Jul 2026 - Present',
        dateDe: 'Jul 2026 - Heute',
        year: 2026,
        month: 7,
        branch: 'main',
        title: 'AI Platform Engineer',
        titleDe: 'AI Platform Engineer',
        company: 'osapiens',
        description: 'Full-time, hybrid role in Mannheim, Baden-Württemberg, Germany.',
        descriptionDe: 'Vollzeit, hybrid in Mannheim, Baden-Württemberg, Deutschland.',
        highlights: [
            'I scale the internal AI platform of osapiens beyond its first pilot phase and develop it further.',
            'I operate and expand the internal AI infrastructure.',
            'I drive AI adoption in engineering and product teams.',
            'I shorten time-to-market with safe and effective AI use in development workflows.',
            'I connect engineering, product, and leadership on the AI strategy.',
        ],
        highlightsDe: [
            'Ich skaliere die interne KI-Plattform von osapiens über die erste Pilotphase hinaus und entwickle sie weiter.',
            'Ich betreibe und erweitere die interne KI-Infrastruktur.',
            'Ich treibe die Nutzung von KI in Engineering- und Produktteams voran.',
            'Ich verkürze die Time-to-Market durch sicheren und wirksamen KI-Einsatz in Entwicklungsabläufen.',
            'Ich verbinde Engineering, Produkt und Führung bei der KI-Strategie.',
        ],
        tags: ['AI Platform', 'Infrastructure', 'AI Adoption'],
        icon: 'robot'
    },
    {
        id: 'federated-cardiac-ct',
        date: 'Feb 2025',
        dateDe: 'Feb 2025',
        year: 2025,
        month: 2,
        branch: 'research',
        title: 'Co-Author: Federated Learning Cardiac CT',
        titleDe: 'Co-Autor: Federated Learning Cardiac CT',
        company: 'npj Digital Medicine',
        description: 'The largest federated cardiac CT analysis (n=8,104), with data from 8 hospitals. The study uses semi-supervised knowledge distillation from CNNs into transformers for multi-label learning.',
        descriptionDe: 'Die größte föderierte Herz-CT-Analyse (n=8.104), mit Daten aus 8 Krankenhäusern. Die Studie nutzt semi-überwachte Wissensdestillation von CNNs in Transformer für Multi-Label-Learning.',
        tags: ['Federated Learning', 'Transformer', 'Cardiac CT'],
        icon: 'microscope',
        projectId: 'federated-cardiac-ct'
    },
    {
        id: 'portfolio-website',
        date: 'Jan 2025',
        dateDe: 'Jan 2025',
        year: 2025,
        month: 1,
        branch: 'homelabbing',
        title: 'Portfolio Website',
        titleDe: 'Portfolio Webseite',
        description: 'I built moritzbednorz.com as my personal portfolio. It is a single-page application with its own router, a git-style timeline, and text in English and German.',
        descriptionDe: 'Ich habe moritzbednorz.com als persönliches Portfolio gebaut. Die Seite ist eine Single-Page-Anwendung mit eigenem Router, einer Timeline im Git-Stil und Texten auf Englisch und Deutsch.',
        tags: ['Bun', 'TypeScript', 'CSS'],
        icon: 'drafting',
        projectId: 'portfolio-website'
    },
    {
        id: 'thoraxmonitor-paper',
        date: 'Nov 2025',
        dateDe: 'Nov 2025',
        year: 2025,
        month: 11,
        branch: 'research',
        title: 'First Author: Contactless Respiratory Flow',
        titleDe: 'Erstautor: Kontaktlose Atemfluss-Rekonstruktion',
        company: 'MDPI Sensors',
        description: 'I showed that a contactless, impedance-based sensor (Thoraxmonitor) can reconstruct respiratory flow quantitatively. This closes the gap to real flow measurement for applications in neonatology.',
        descriptionDe: 'Ich habe gezeigt, dass ein kontaktloser, impedanzbasierter Sensor (Thoraxmonitor) den Atemfluss quantitativ rekonstruieren kann. Das schließt die Lücke zur echten Flussmessung für Anwendungen in der Neonatologie.',
        tags: ['Sensors', 'ML', 'Neonatology', 'Bioimpedance'],
        icon: 'microscope',
        projectId: 'respiratory-flow-reconstruction'
    },
    {
        id: 'fipa-re',
        date: 'Feb 2024 - Jun 2026',
        dateDe: 'Feb 2024 - Jun 2026',
        year: 2024,
        month: 2,
        branch: 'main',
        title: 'Research Engineer',
        titleDe: 'Forschungsingenieur',
        company: 'Fraunhofer IPA',
        description: 'Full-time, hybrid role in Mannheim, Baden-Württemberg, Germany.',
        descriptionDe: 'Vollzeit, hybrid in Mannheim, Baden-Württemberg, Deutschland.',
        highlights: [
            'I led interdisciplinary teams and got third-party funding (BMBF, EU, and industry).',
            'I protected research results with patents and international publications.',
            'I designed scalable microservice systems (Docker, Python) that combine privacy-compliant RAG chatbots and event-driven workflows for the real-time analysis of medical sensor data.',
            'I developed algorithms for biosignal analysis, for example contactless respiratory monitoring, with a focus on explainable AI (XAI) for clinical use.',
            'I developed technical concepts and CAD-based prototypes to validate new sensor solutions.',
        ],
        highlightsDe: [
            'Ich habe interdisziplinäre Teams geleitet und Drittmittel eingeworben (BMBF, EU und Industrie).',
            'Ich habe Forschungsergebnisse mit Patenten und internationalen Publikationen gesichert.',
            'Ich habe skalierbare Microservice-Systeme (Docker, Python) entworfen, die datenschutzkonforme RAG-Chatbots und ereignisgesteuerte Workflows für die Echtzeitanalyse medizinischer Sensordaten verbinden.',
            'Ich habe Algorithmen für die Biosignalanalyse entwickelt, zum Beispiel für die kontaktlose Atemüberwachung, mit Fokus auf erklärbare KI (XAI) für den klinischen Einsatz.',
            'Ich habe technische Konzepte und CAD-basierte Prototypen zur Validierung neuer Sensorlösungen entwickelt.',
        ],
        tags: ['RAG', 'Docker', 'Python', 'XAI', 'Sensors'],
        icon: 'robot'
    },
    {
        id: 'ukhd-msc',
        date: 'Oct 2023',
        dateDe: 'Okt 2023',
        year: 2023,
        month: 10,
        branch: 'education',
        title: 'M.Sc. Medical Informatics',
        titleDe: 'M.Sc. Medizinische Informatik',
        company: 'Heidelberg University',
        description: 'Graduated with a grade of 1.2. Focus: data science, computer-aided diagnosis, and therapy systems.',
        descriptionDe: 'Abschluss mit der Note 1,2. Schwerpunkte: Data Science, computergestützte Diagnose und Therapiesysteme.',
        tags: ['Master', '1.2 Grade', 'Data Science'],
        icon: 'graduation'
    },
    {
        id: 'ukhd-thesis',
        date: 'Sep 2023',
        dateDe: 'Sep 2023',
        year: 2023,
        month: 9,
        branch: 'research',
        title: 'Master Thesis: Bayesian Federated Learning',
        titleDe: 'Masterarbeit: Bayesian Federated Learning',
        company: 'University Hospital Heidelberg',
        description: 'I developed Bayesian Federated Learning methods for the selection of transcatheter aortic valve prostheses.',
        descriptionDe: 'Ich habe Methoden für Bayesian Federated Learning zur Auswahl von Transkatheter-Aortenklappenprothesen entwickelt.',
        tags: ['PyTorch', 'Bayesian', 'Federated Learning'],
        icon: 'microscope'
    },
    {
        id: 'ukhd-ra',
        date: 'Aug 2023',
        dateDe: 'Aug 2023',
        year: 2023,
        month: 8,
        branch: 'main',
        title: 'Research Assistant (AICM)',
        titleDe: 'Wissenschaftliche Hilfskraft (AICM)',
        company: 'University Hospital Heidelberg',
        description: 'I worked on AI in cardiovascular medicine. My focus was uncertainty quantification and knowledge distillation.',
        descriptionDe: 'Ich habe an KI in der kardiovaskulären Medizin gearbeitet. Mein Schwerpunkt war Unsicherheitsquantifizierung und Knowledge Distillation.',
        tags: ['Deep Learning', 'PyTorch', 'Cardiac Imaging'],
        icon: 'heart'
    },
    {
        id: 'homelab-cm3588',
        date: 'Dec 2024',
        dateDe: 'Dez 2024',
        year: 2024,
        month: 12,
        branch: 'homelabbing',
        title: 'CM3588 NAS Homelab',
        titleDe: 'CM3588 NAS Homelab',
        description: 'I built a NAS based on the RK3588, with 16 GB RAM and 8 TB NVMe in RAID6. It runs OMV, Immich, Home Assistant, AdGuard, and Stirling PDF. Remote access goes through Cloudflare Zero Trust.',
        descriptionDe: 'Ich habe ein NAS auf Basis des RK3588 gebaut, mit 16 GB RAM und 8 TB NVMe im RAID6. Darauf laufen OMV, Immich, Home Assistant, AdGuard und Stirling PDF. Der Fernzugriff läuft über Cloudflare Zero Trust.',
        tags: ['RK3588', 'NAS', 'Docker', 'Self-Hosted'],
        icon: 'server',
        projectId: 'homelab-cm3588'
    },
    {
        id: 'patent-filing',
        date: '2022 (DE) - 2023 (EU)',
        dateDe: '2022 (DE) - 2023 (EU)',
        year: 2022,
        month: 4,
        branch: 'research',
        title: 'Co-Inventor: Patent Core Technology',
        titleDe: 'Miterfinder: Patent Kerntechnologie',
        company: 'Fraunhofer IPA',
        description: 'I co-invented a method to measure processes in objects. It is the core technology of the Thoraxmonitor. The patent is currently in the application phase in Germany (DE) and the EU.',
        descriptionDe: 'Ich bin Miterfinder eines Verfahrens zur Vermessung von Abläufen in Objekten. Es ist die Kerntechnologie des Thoraxmonitors. Das Patent ist derzeit in Deutschland (DE) und der EU in der Anmeldephase.',
        tags: ['Patent', 'IP', 'MedTech'],
        icon: 'award',
        projectId: 'patent-measuring-process'
    },
    {
        id: 'ukhd-project',
        date: 'Dec 2022',
        dateDe: 'Dez 2022',
        year: 2022,
        month: 12,
        branch: 'research',
        title: 'Aortic Valve Analysis on CT',
        titleDe: 'Aortenklappen-Analyse auf CT',
        company: 'University Hospital Heidelberg',
        description: 'I analyzed aortic valves on CT images with deep learning in PyTorch.',
        descriptionDe: 'Ich habe Aortenklappen auf CT-Bildern mit Deep Learning in PyTorch analysiert.',
        tags: ['Medical Imaging', 'CT', 'Deep Learning'],
        icon: 'image'
    },
    {
        id: 'fipa-gra',
        date: 'Nov 2021',
        dateDe: 'Nov 2021',
        year: 2021,
        month: 11,
        branch: 'main',
        title: 'Graduate Research Assistant',
        titleDe: 'Wissenschaftliche Hilfskraft',
        company: 'Fraunhofer IPA',
        description: 'I continued my research work during my master\'s studies.',
        descriptionDe: 'Ich habe meine Forschungsarbeit während des Masterstudiums fortgesetzt.',
        tags: ['R&D', 'Medical Tech'],
        icon: 'flask'
    },
    {
        id: 'ulm-be',
        date: 'Aug 2021',
        dateDe: 'Aug 2021',
        year: 2021,
        month: 8,
        branch: 'education',
        title: 'B.Eng. Medical Engineering',
        titleDe: 'B.Eng. Medizintechnik',
        company: 'TH Ulm',
        description: 'Focus: medical electronics and software development.',
        descriptionDe: 'Schwerpunkte: Medizinelektronik und Softwareentwicklung.',
        tags: ['Bachelor', 'Electronics'],
        icon: 'university'
    },
    {
        id: 'fipa-bthesis',
        date: 'Aug 2021',
        dateDe: 'Aug 2021',
        year: 2021,
        month: 8,
        branch: 'research',
        title: 'Bachelor Thesis: ML for Cardiorespiratory Patterns',
        titleDe: 'Bachelorarbeit: ML für kardiorespiratorische Muster',
        company: 'Fraunhofer IPA',
        description: 'I validated machine learning methods that classify and recognize cardiorespiratory patterns.',
        descriptionDe: 'Ich habe ML-Methoden zur Klassifikation und Erkennung kardiorespiratorischer Muster validiert.',
        tags: ['Signal Processing', 'Machine Learning'],
        icon: 'book'
    },
    {
        id: 'seoul-exchange',
        date: 'Mar 2020',
        dateDe: 'Mär 2020',
        year: 2020,
        month: 3,
        branch: 'education',
        title: 'Exchange Semester',
        titleDe: 'Auslandssemester',
        company: 'SNUST Seoul',
        description: 'A semester in South Korea with a focus on data science and Python.',
        descriptionDe: 'Ein Semester in Südkorea mit Schwerpunkt auf Data Science und Python.',
        tags: ['Global', 'Seoul', 'Python'],
        icon: 'plane'
    },
    {
        id: 'fipa-intern',
        date: 'Aug 2019',
        dateDe: 'Aug 2019',
        year: 2019,
        month: 8,
        branch: 'main',
        title: 'Research Intern',
        titleDe: 'Forschungspraktikant',
        company: 'Fraunhofer IPA',
        description: 'Android development for surgical robots, work with microcontrollers, and Deep Reinforcement Learning.',
        descriptionDe: 'Android-Entwicklung für Chirurgieroboter, Arbeit mit Mikrocontrollern und Deep Reinforcement Learning.',
        tags: ['Android', 'Robotics', 'Reinforcement Learning'],
        icon: 'cogs'
    },
    {
        id: 'beikirch',
        date: 'Jun 2017',
        dateDe: 'Jun 2017',
        year: 2017,
        month: 6,
        branch: 'main',
        title: 'Technical System Planner',
        titleDe: 'Technischer Systemplaner',
        company: 'Beikirch',
        description: 'I planned electrical installations for large projects such as Alter Wall Hamburg.',
        descriptionDe: 'Ich habe Elektroinstallationen für Großprojekte wie Alter Wall Hamburg geplant.',
        tags: ['CAD', 'Engineering', 'Project Management'],
        icon: 'drafting'
    },
    {
        id: 'rs-apprenticeship',
        date: 'Aug 2014',
        dateDe: 'Aug 2014',
        year: 2014,
        month: 8,
        branch: 'main',
        title: 'Apprenticeship (IHK Award)',
        titleDe: 'Ausbildung (IHK-Auszeichnung)',
        company: 'R+S Group',
        description: 'I received an IHK award for the best examination result in my occupational group.',
        descriptionDe: 'Ich habe eine IHK-Auszeichnung für die beste Prüfungsleistung in meiner Berufsgruppe erhalten.',
        tags: ['IHK Award', 'Electrical Systems'],
        icon: 'award'
    },
    {
        id: 'fbs-college',
        date: 'Jul 2014',
        dateDe: 'Jul 2014',
        year: 2014,
        month: 7,
        branch: 'education',
        title: 'Technical College Entrance',
        titleDe: 'Fachhochschulreife',
        company: 'Ferdinand-Braun-Schule',
        description: 'Technical college entrance qualification with a focus on mechanical engineering.',
        descriptionDe: 'Fachhochschulreife mit Schwerpunkt Maschinenbau.',
        tags: ['Mechanical Eng', 'Design'],
        icon: 'school'
    },
    {
        id: 'wassermann',
        date: 'Aug 2012',
        dateDe: 'Aug 2012',
        year: 2012,
        month: 8,
        branch: 'main',
        title: 'Mechanical Engineering Intern',
        titleDe: 'Maschinenbau-Praktikant',
        company: 'Wassermann Technologie',
        description: 'Design and assembly of CNC tool-changing systems.',
        descriptionDe: 'Konstruktion und Montage von CNC-Werkzeugwechselsystemen.',
        tags: ['CNC', 'Mechanics'],
        icon: 'tools'
    }
];

/**
 * Get sorted timeline events (newest first)
 */
export function getSortedEvents(): TimelineEvent[] {
    return [...TIMELINE_DATA].sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
    });
}

/**
 * Get branch by ID
 */
export function getBranchById(id: string): BranchConfig | undefined {
    return BRANCHES.find(b => b.id === id);
}
