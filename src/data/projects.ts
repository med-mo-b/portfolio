/**
 * Projects data for the Work page
 * Featured projects with detailed information
 */

/**
 * Project interface
 */
export interface Project {
    id: string;
    title: string;
    titleDe: string;
    role?: string;
    roleDe?: string;
    description: string;
    descriptionDe: string;
    details: string;
    detailsDe: string;
    category: 'project' | 'publication';
    size?: 'normal' | 'tall' | 'short';
    orientation?: 'landscape' | 'portrait';
    audio?: boolean;
    tech: string[];
    image?: string;
    video?: string;
    links?: {
        github?: string;
        external?: string;
        externalDe?: string;
        paper?: string;
    };
}

/**
 * Featured projects array
 */
export const PROJECTS: Project[] = [
    {
        id: 'thoraxmonitor',
        title: 'Thoraxmonitor',
        titleDe: 'Thoraxmonitor',
        role: 'Product Owner',
        roleDe: 'Product Owner',
        description: 'Contactless respiratory monitoring system. Uses UHF sensing to measure volumetric lung activity without skin contact.',
        descriptionDe: 'Kkontaktloses Atem-Monitoringsystem. Nutzt UHF-Technologie zur Messung des Lungenvolumens ohne Hautkontakt.',
        details: 'As Product Owner, I am leading the development of this sensor system, which can measure respiratory monitoring without contact. Unlike radar or cameras, which only detect surface movements, the chest monitor uses a 433 MHz UHF field to measure actual air volume changes inside the lungs (dielectric properties) through clothing. This volumetric approach provides accurate respiratory flow data comparable to clinical reference devices. The system uses deep learning (neural networks) to reconstruct flow signals in real time and can be used flexibly in various clinical scenarios.',
        detailsDe: 'Als Product Owner leite ich die Entwicklung dieses Sensorsystems, das die Atemüberwachung kontaktlos messen kann. Im Gegensatz zu Radar oder Kameras, die nur Oberflächenbewegungen erfassen, nutzt der Thoraxmonitor ein 433 MHz UHF-Feld, um tatsächliche Luftvolumenänderungen im Inneren der Lunge (dielektrische Eigenschaften) durch Kleidung hindurch zu messen. Dieser volumetrische Ansatz liefert präzise Atemflussdaten, vergleichbar mit klinischen Referenzgeräten. Das System verwendet Deep Learning (Neuronale Netze), um Flusssignale in Echtzeit zu rekonstruieren, und ist flexibel in verschiedenen klinischen Szenarien einsetzbar.',
        category: 'project',
        orientation: 'landscape',
        size: 'tall',
        tech: ['Product Management', 'UHF Sensing', 'Signal Processing', 'Deep Learning'],
        image: '/images/thoraxmonitor.webp',
        // video: 'https://gesundheitstechnologien.ipa.fraunhofer.de/content/dam/pamb/en/video/Thoraxmonitor%20Video%202022%20-%20FINAL%20-%20MIT%20Untertiteln%20EN.mp4#t=6',
        links: {
            external: 'https://gesundheitstechnologien.ipa.fraunhofer.de/en/our_projects/thoraxmonitor_en.html',
            externalDe: 'https://gesundheitstechnologien.ipa.fraunhofer.de/de/unsere_projekte/thoraxmonitor.html'
        }
    },
    {
        id: 'tedias-ahead',
        title: 'RAG-Chatbot "DARIAN" (TEDIAS)',
        titleDe: 'RAG-Chatbot "DARIAN" (TEDIAS)',
        role: 'Lead Architect / Developer', 
        description: 'Production-ready, on-premise RAG system. Microservices architecture integrating FHIR patient data with clinical guidelines.',
        descriptionDe: 'Produktionsreifes On-Premise RAG-System. Microservices-Architektur zur Integration von FHIR-Patientendaten mit klinischen Leitlinien.',
        details: 'I developed DARIAN, a medical co-pilot system based on Retrieval-Augmented Generation (RAG). It combines real-time patient data (via FHIR standards) with verified clinical guidelines (S3, SOPs) to provide evidence-based decision support. Technically, the system is built on a modular Docker microservices architecture that is production-ready. This allows for simple one-click on-premise deployment. Thanks to this local approach and strict security-by-design principles, sensitive data never leaves the hospital infrastructure.',
        detailsDe: 'Mit DARIAN habe ich einen medizinischen Co-Piloten auf Basis von Retrieval-Augmented Generation (RAG) entwickelt. Er verknüpft Echtzeit-Patientendaten (via FHIR-Standard) mit validierten klinischen Leitlinien (S3, SOPs), um fundierte Entscheidungshilfen mit Quellenangabe zu liefern. Technisch setzt das System auf eine modulare, produktionsreife Microservices-Architektur in Docker. Das ermöglicht ein einfaches One-Click-Deployment auf eigenen Servern (On-Premise). Durch diesen lokalen Ansatz und konsequentes Security-by-Design verlassen sensible Daten zu keinem Zeitpunkt die geschützte Klinikinfrastruktur.',
        category: 'project',
        orientation: 'landscape',
        tech: ['Microservices', 'Docker', 'FHIR', 'RAG / LLMs', 'Python'],
        image: 'https://gesundheitstechnologien.ipa.fraunhofer.de/de/unsere_projekte/rag-chatbot/jcr:content/contentPar/sectioncomponent_181/sectionParsys/wideimage_299877879/imageComponent/image.img.4col.jpg/1762261612109/architecture-C4-Container-C4-Container-1.jpg',
        // video: 'https://gesundheitstechnologien.ipa.fraunhofer.de/content/dam/pamb/de/video/RAG-Chatbot_Video_Interaktion.mp4',
        links: {
            external: 'https://gesundheitstechnologien.ipa.fraunhofer.de/de/unsere_projekte/rag-chatbot.html',
        }
    },
    {
        id: 'federated-cardiac-ct',
        title: 'Federated Learning Cardiac CT',
        titleDe: 'Federated Learning Cardiac CT',
        description: 'Federated analysis of 8,000+ cardiac CT scans across 8 hospitals. Semi-supervised knowledge distillation from CNNs into transformers for multi-label learning.',
        descriptionDe: 'Föderierte Analyse von über 8.000 Herz-CT-Scans über 8 Krankenhäuser. Semi-überwachte Wissensdestillation von CNNs in Transformer für Multi-Label-Learning.',
        details: 'This research project represents the largest federated cardiac CT analysis conducted to date, involving over 8,000 scans across 8 participating hospitals. The work focuses on semi-supervised knowledge distillation techniques, transferring learned representations from convolutional neural networks (CNNs) into transformer architectures for improved multi-label learning performance. The federated learning approach ensures patient data privacy by training models locally at each hospital without sharing raw data. The resulting models achieve state-of-the-art performance in cardiac pathology detection while maintaining strict privacy guarantees. Published in Nature Digital Medicine.',
        detailsDe: 'Dieses Forschungsprojekt stellt die größte föderierte Cardiac-CT-Analyse dar, die bisher durchgeführt wurde, mit über 8.000 Scans über 8 teilnehmende Krankenhäuser. Die Arbeit konzentriert sich auf semi-überwachte Wissensdestillationstechniken, die gelernte Repräsentationen von Convolutional Neural Networks (CNNs) in Transformer-Architekturen übertragen, um die Multi-Label-Learning-Leistung zu verbessern. Der föderierte Lernansatz gewährleistet die Privatsphäre der Patientendaten, indem Modelle lokal in jedem Krankenhaus trainiert werden, ohne Rohdaten zu teilen. Die resultierenden Modelle erreichen Spitzenleistungen bei der Erkennung von Herzerkrankungen und gewährleisten gleichzeitig strenge Datenschutzgarantien. Veröffentlicht in Nature Digital Medicine.',
        category: 'publication',
        orientation: 'portrait',
        tech: ['PyTorch', 'Federated Learning', 'Transformers'],
        image: '/images/federated_paper.webp',
        links: {
            paper: 'https://www.nature.com/articles/s41746-025-01434-3'
        }
    },
    {
        id: 'portfolio-website',
        title: 'Portfolio Website',
        titleDe: 'Portfolio Webseite',
        description: 'This website. Modern SPA with custom router, git-style timeline visualization, and bilingual support. Built with TypeScript, Bun, and CSS without frameworks.',
        descriptionDe: 'Diese Webseite. Moderne SPA mit eigenem Router, Git-Style Timeline-Visualisierung und zweisprachiger Unterstützung. Erstellt mit TypeScript, Bun und CSS ohne Frameworks.',
        details: 'A modern single-page application built from scratch without heavy frameworks. Features a custom router implementation for seamless navigation, a unique git-style timeline visualization for the about page, and full bilingual support (English/German) with dynamic language switching. The architecture emphasizes performance and maintainability, using TypeScript for type safety, Bun for fast development and optimized builds, and pure CSS for styling without framework dependencies. The design follows a retro/terminal aesthetic with VT323 font and noise overlay effects, creating a distinctive visual identity.',
        detailsDe: 'Eine moderne Single-Page-Anwendung, die von Grund auf ohne schwere Frameworks erstellt wurde. Enthält eine eigene Router-Implementierung für nahtlose Navigation, eine einzigartige Git-Style Timeline-Visualisierung für die About-Seite und vollständige zweisprachige Unterstützung (Englisch/Deutsch) mit dynamischem Sprachwechsel. Die Architektur betont Leistung und Wartbarkeit, verwendet TypeScript für Typsicherheit, Bun für schnelle Entwicklung und optimierte Builds, und reines CSS für das Styling ohne Framework-Abhängigkeiten. Das Design folgt einer Retro/Terminal-Ästhetik mit VT323-Schriftart und Noise-Overlay-Effekten, wodurch eine unverwechselbare visuelle Identität entsteht.',
        category: 'project',
        orientation: 'landscape',
        tech: ['TypeScript', 'Bun', 'CSS'],
        image: '/images/portfolio_about_screenshot.webp',
        video: 'videos/portfolio.mp4',
        audio: false,
        links: {
            github: 'https://github.com/med-mo-b/portfolio'
        }
    },
    {
        id: 'respiratory-flow-reconstruction',
        title: 'Respiratory Flow Reconstruction',
        titleDe: 'Rekonstruktion des Atemflusses',
        role: 'First Author',
        roleDe: 'Erstautor',
        size: 'tall',
        description: 'Reconstruction of full respiratory flow using contactless impedance sensing and machine learning. Closes the gap to true flow measurement for sensitive clinical areas.',
        descriptionDe: 'Rekonstruktion des vollständigen Atemflusses mittels kontaktloser Impedanzmessung und Machine Learning. Schließt die Lücke zur echten Flow-Messung für sensitive klinische Bereiche.',
        details: 'This work demonstrates that the contactless, impedance-based sensor system (Thoraxmonitor) is capable of reconstructing not just the respiratory rate, but the complete respiratory flow quantitatively. In contrast to existing radar or camera technologies, this approach closes the gap to true flow measurement. This opens up enormous potential for clinical areas where wired sensors or direct skin contact are problematic—for example, in neonatology for the protection of sensitive preterm infants. The research proves practical applicability, showing that even simple machine learning methods are sufficient to realize a precise mapping between the sensor signal and the actual respiratory flow.',
        detailsDe: 'Diese Arbeit demonstriert, dass das kontaktlose, impedanzbasierte Sensorsystem (Thoraxmonitor) in der Lage ist, nicht nur die Atemfrequenz, sondern den vollständigen Atemfluss quantitativ zu rekonstruieren. Im Gegensatz zu bestehenden Radar- oder Kameratechnologien schließt dieser Ansatz die Lücke zur echten Flow-Messung. Dies eröffnet enorme Potenziale für klinische Bereiche, in denen kabelgebundene Sensoren oder direkter Hautkontakt problematisch sind – beispielsweise in der Neonatologie zum Schutz empfindlicher Frühgeborener. Die Arbeit ist mehr als theoretische Forschung; sie beweist die praktische Anwendbarkeit. Es konnte gezeigt werden, dass bereits einfache maschinelle Lernmethoden ausreichen, um ein präzises Mapping zwischen dem Sensorsignal und dem tatsächlichen Atemfluss zu realisieren.',
        category: 'publication',
        orientation: 'portrait',
        tech: ['Machine Learning', 'UHF Sensing', 'Python', 'Signal Processing'],
        image: '/images/mdpi_tm_abstract.webp',
        links: {
            paper: 'https://www.mdpi.com/1424-8220/25/23/7114'
        }
    },
    {
        id: 'patent-measuring-process',
        title: 'Patent: Process Measurement in Objects',
        titleDe: 'Patent: Vermessung eines Ablaufs in einem Objekt',
        role: 'Co-Inventor',
        roleDe: 'Miterfinder',
        description: 'Patent for contactless measurement of physiological processes using electromagnetic fields and AI models. Currently in the application phase.',
        descriptionDe: 'Patent zur kontaktlosen Vermessung physiologischer Abläufe mittels elektromagnetischer Wechselfelder und KI-Modellen. Derzeit in der Anmeldephase.',
        details: 'This patent (EP4504045A1) describes a method and apparatus for measuring processes within an object. It covers the core technology of radiating electromagnetic alternating fields, receiving the modulated signals, and using statistical models—specifically neural networks—to reconstruct vital parameters like respiratory flow or cardiac activity in real-time without skin contact. The patent is currently in the application phase.',
        detailsDe: 'Dieses Patent (EP4504045A1) beschreibt ein Verfahren und eine Vorrichtung zur Vermessung von Abläufen in einem Objekt. Es umfasst die Kerntechnologie des Einstrahlens elektromagnetischer Wechselfelder, den Empfang der modulierten Signale und die Nutzung statistischer Modelle – insbesondere neuronaler Netze –, um Vitalparameter wie Atemfluss oder Herzaktivität kontaktlos und in Echtzeit zu rekonstruieren. Das Patent befindet sich derzeit in der Anmeldephase.',
        category: 'publication',
        orientation: 'landscape',
        tech: ['Patent Law', 'Signal Processing', 'AI', 'Electromagnetics'],
        image: '/images/European-Patent-Office-Logo-Vector.svg-.webp',
        links: {
            paper: 'https://patents.google.com/patent/EP4504045A1/de'
        }
    }
];
