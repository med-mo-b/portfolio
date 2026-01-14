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
        id: 'federated-cardiac-ct',
        date: 'Feb 2025',
        dateDe: 'Feb 2025',
        year: 2025,
        month: 2,
        branch: 'research',
        title: 'Co-Author: Federated Learning Cardiac CT',
        titleDe: 'Co-Autor: Federated Learning Cardiac CT',
        company: 'npj Digital Medicine',
        description: 'Largest federated cardiac CT analysis (n=8,104) across 8 hospitals. Semi-supervised knowledge distillation from CNNs into transformers for multi-label learning.',
        descriptionDe: 'Größte föderierte Cardiac-CT-Analyse (n=8.104) über 8 Krankenhäuser. Semi-überwachte Wissensdestillation von CNNs in Transformer für Multi-Label-Learning.',
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
        description: 'Built moritzbednorz.com as a personal portfolio. Modern SPA with custom router, git-style timeline, and bilingual support.',
        descriptionDe: 'Erstellung von moritzbednorz.com als persönliches Portfolio. Moderne SPA mit eigenem Router, Git-Style Timeline und zweisprachiger Unterstützung.',
        tags: ['Bun', 'TypeScript', 'CSS'],
        icon: 'drafting',
        projectId: 'portfolio-website'
    },
    {
        id: 'thoraxmonitor-paper',
        date: 'Nov 2024',
        dateDe: 'Nov 2024',
        year: 2024,
        month: 11,
        branch: 'research',
        title: 'First Author: Contactless Respiratory Flow',
        titleDe: 'Erstautor: Kontaktlose Atemfluss-Rekonstruktion',
        company: 'MDPI Sensors',
        description: 'Demonstrated contactless impedance-based sensor (Thoraxmonitor) for quantitative respiratory flow reconstruction. Bridging gap to real flow measurement for neonatology applications.',
        descriptionDe: 'Nachweis eines kontaktlosen impedanzbasierten Sensors (Thoraxmonitor) zur quantitativen Atemfluss-Rekonstruktion. Schließt die Lücke zur echten Flow-Messung für Neonatologie.',
        tags: ['Sensors', 'ML', 'Neonatology', 'Bioimpedance'],
        icon: 'microscope',
        projectId: 'thoraxmonitor'
    },
    {
        id: 'fipa-re',
        date: 'Feb 2024 - Present',
        dateDe: 'Feb 2024 - Heute',
        year: 2024,
        month: 2,
        branch: 'main',
        title: 'Research Engineer',
        titleDe: 'Forschungsingenieur',
        company: 'Fraunhofer IPA',
        description: 'Leading interdisciplinary projects. Integrating dockerized RAG chatbots for secure medical data. Developing deep learning and sensor solutions.',
        descriptionDe: 'Leitung interdisziplinärer Projekte. Integration von dockerisierten RAG-Chatbots für sichere medizinische Daten. Entwicklung von Deep Learning und Sensor-Lösungen.',
        tags: ['RAG', 'Docker', 'AI', 'Sensors'],
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
        description: 'Graduated with 1.2. Focus on Data Science, computer-aided diagnosis, and therapy systems.',
        descriptionDe: 'Abschluss mit 1,2. Schwerpunkt auf Data Science, computergestützte Diagnose und Therapiesysteme.',
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
        description: 'Developed Bayesian Federated Learning methods for Transcatheter Aortic Valve Prosthesis selection.',
        descriptionDe: 'Entwicklung von Bayesian Federated Learning Methoden für die Auswahl von Transkatheter-Aortenklappenprothesen.',
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
        description: 'Worked on AI in Cardiovascular Medicine. Specialized in Uncertainty Quantification and Knowledge Distillation.',
        descriptionDe: 'Arbeit an KI in der Kardiovaskulären Medizin. Spezialisierung auf Unsicherheitsquantifizierung und Knowledge Distillation.',
        tags: ['Deep Learning', 'PyTorch', 'Cardiac Imaging'],
        icon: 'heart'
    },
    {
        id: 'homelab-cm3588',
        date: 'Dez 2024',
        dateDe: 'Dez 2024',
        year: 2024,
        month: 12,
        branch: 'homelabbing',
        title: 'CM3588 NAS Homelab',
        titleDe: 'CM3588 NAS Homelab',
        description: 'Built RK3588-based NAS with 16GB RAM, 8TB NVMe RAID6. Running OMV, Immich, Home Assistant, AdGuard, Stirling PDF via Cloudflare Zero Trust.',
        descriptionDe: 'RK3588-basierter NAS mit 16GB RAM, 8TB NVMe RAID6. Betreibt OMV, Immich, Home Assistant, AdGuard, Stirling PDF via Cloudflare Zero Trust.',
        tags: ['RK3588', 'NAS', 'Docker', 'Self-Hosted'],
        icon: 'server'
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
        description: 'Deep Learning-based analysis of aortic valves on CT images using PyTorch.',
        descriptionDe: 'Deep Learning-basierte Analyse von Aortenklappen auf CT-Bildern mit PyTorch.',
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
        description: 'Continued research activities while pursuing Master studies.',
        descriptionDe: 'Fortsetzung der Forschungsaktivitäten während des Masterstudiums.',
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
        description: 'Focus on medical electronics and software development.',
        descriptionDe: 'Schwerpunkt auf Medizinelektronik und Softwareentwicklung.',
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
        description: 'Validation of ML methods for classification and recognition of cardiorespiratory patterns.',
        descriptionDe: 'Validierung von ML-Methoden zur Klassifikation und Erkennung kardiorespiratorischer Muster.',
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
        description: 'International experience in South Korea focusing on Data Science and Python.',
        descriptionDe: 'Internationale Erfahrung in Südkorea mit Fokus auf Data Science und Python.',
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
        description: 'Android development for surgical robots, microcontrollers, and Deep Reinforcement Learning.',
        descriptionDe: 'Android-Entwicklung für Chirurgieroboter, Mikrocontroller und Deep Reinforcement Learning.',
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
        description: 'Planning electrical installations for large-scale projects like Alter Wall Hamburg.',
        descriptionDe: 'Planung von Elektroinstallationen für Großprojekte wie Alter Wall Hamburg.',
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
        description: 'Received IHK award for best examination performance in the occupational group.',
        descriptionDe: 'IHK-Auszeichnung für beste Prüfungsleistung in der Berufsgruppe erhalten.',
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
        description: 'Advanced technical qualification in Mechanical Engineering.',
        descriptionDe: 'Weiterführende technische Qualifikation im Maschinenbau.',
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
        description: 'Construction and assembly of CNC tool changing systems.',
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
