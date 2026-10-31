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
    category: 'project' | 'publication' | 'sidequest';
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
        description: 'A contactless system for respiratory monitoring. It uses UHF sensing to measure lung volume changes without skin contact.',
        descriptionDe: 'Ein kontaktloses System zur Atemüberwachung. Es misst Änderungen des Lungenvolumens mit UHF-Technik, ohne Hautkontakt.',
        details: 'As Product Owner, I led the development of this contactless sensor system for respiratory monitoring. Radar and cameras only detect movements of the body surface. The Thoraxmonitor uses a 433 MHz UHF field instead. It measures the real changes of air volume inside the lungs (dielectric properties), through clothing. This volumetric method gives accurate respiratory flow data, comparable to clinical reference devices. Neural networks (deep learning) reconstruct the flow signal in real time. The system can be used in different clinical scenarios.',
        detailsDe: 'Als Product Owner habe ich die Entwicklung dieses kontaktlosen Sensorsystems zur Atemüberwachung geleitet. Radar und Kameras erfassen nur Bewegungen der Körperoberfläche. Der Thoraxmonitor nutzt dagegen ein 433-MHz-UHF-Feld. Er misst die tatsächlichen Luftvolumenänderungen in der Lunge (dielektrische Eigenschaften), auch durch Kleidung. Dieser volumetrische Ansatz liefert genaue Atemflussdaten, vergleichbar mit klinischen Referenzgeräten. Neuronale Netze (Deep Learning) rekonstruieren das Flusssignal in Echtzeit. Das System ist in verschiedenen klinischen Szenarien einsetzbar.',
        category: 'project',
        orientation: 'landscape',
        size: 'short',
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
        description: 'A production-ready RAG system that runs on-premise. Its microservices connect FHIR patient data with clinical guidelines.',
        descriptionDe: 'Ein produktionsreifes RAG-System für den On-Premise-Betrieb. Seine Microservices verbinden FHIR-Patientendaten mit klinischen Leitlinien.',
        details: 'I developed DARIAN, a medical co-pilot based on Retrieval-Augmented Generation (RAG). It combines real-time patient data (FHIR standard) with verified clinical guidelines (S3, SOPs). This gives evidence-based decision support. The system uses a modular, production-ready microservices architecture in Docker. One click deploys it on-premise. The system runs locally and follows strict security-by-design principles. Sensitive data never leaves the hospital infrastructure.',
        detailsDe: 'Ich habe DARIAN entwickelt, einen medizinischen Co-Piloten auf Basis von Retrieval-Augmented Generation (RAG). Er verknüpft Echtzeit-Patientendaten (FHIR-Standard) mit validierten klinischen Leitlinien (S3, SOPs). So liefert er fundierte Entscheidungshilfen mit Quellenangabe. Das System nutzt eine modulare, produktionsreife Microservices-Architektur in Docker. Ein Klick installiert es auf eigenen Servern (On-Premise). Das System läuft lokal und folgt konsequent Security-by-Design. Sensible Daten verlassen die Klinikinfrastruktur nie.',
        category: 'project',
        orientation: 'landscape',
        size: 'short',
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
        description: 'Federated analysis of more than 8,000 cardiac CT scans from 8 hospitals. Semi-supervised knowledge distillation transfers knowledge from CNNs into transformers for multi-label learning.',
        descriptionDe: 'Föderierte Analyse von über 8.000 Herz-CT-Scans aus 8 Krankenhäusern. Semi-überwachte Wissensdestillation überträgt Wissen von CNNs in Transformer für Multi-Label-Learning.',
        details: 'This study is the largest federated cardiac CT analysis to date. It includes more than 8,000 scans from 8 hospitals. The work uses semi-supervised knowledge distillation. This method transfers learned representations from convolutional neural networks (CNNs) into transformer models to improve multi-label learning. Each hospital trains the models locally, so raw patient data is not shared. The models reach state-of-the-art performance in the detection of cardiac pathologies, with strict privacy protection. Published in npj Digital Medicine.',
        detailsDe: 'Diese Studie ist die bisher größte föderierte Herz-CT-Analyse. Sie umfasst über 8.000 Scans aus 8 Krankenhäusern. Die Arbeit nutzt semi-überwachte Wissensdestillation. Diese Methode überträgt gelernte Repräsentationen von Convolutional Neural Networks (CNNs) in Transformer-Modelle und verbessert so das Multi-Label-Learning. Jedes Krankenhaus trainiert die Modelle lokal, Rohdaten von Patienten werden nicht geteilt. Die Modelle erreichen Spitzenleistungen bei der Erkennung von Herzerkrankungen, bei strengem Datenschutz. Veröffentlicht in npj Digital Medicine.',
        category: 'publication',
        orientation: 'portrait',
        size: 'short',
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
        description: 'This website. One page with a git-style timeline, a WebGL background, and text in English and German. Built with TypeScript, Bun, and CSS, without frameworks.',
        descriptionDe: 'Diese Webseite. Eine Seite mit einer Timeline im Git-Stil, einem WebGL-Hintergrund und Texten auf Englisch und Deutsch. Gebaut mit TypeScript, Bun und CSS, ohne Frameworks.',
        details: 'I built this one-page site from scratch, without frameworks. It has a git-style timeline of my career, a WebGL background, a custom cursor, and full English and German text with a language switch. TypeScript gives type safety. Bun gives fast development and optimized builds. Plain CSS does all the styling. The design uses serif and monospace fonts, a film-grain texture, and a light and a dark mode.',
        detailsDe: 'Ich habe diese Seite von Grund auf gebaut, ohne Frameworks. Sie hat eine Timeline meines Werdegangs im Git-Stil, einen WebGL-Hintergrund, einen eigenen Cursor und vollständige Texte auf Englisch und Deutsch mit Sprachumschaltung. TypeScript sorgt für Typsicherheit. Bun sorgt für schnelle Entwicklung und optimierte Builds. Reines CSS übernimmt das gesamte Styling. Das Design nutzt Serifen- und Monospace-Schriften, eine Filmkorn-Textur sowie einen hellen und einen dunklen Modus.',
        category: 'sidequest',
        orientation: 'landscape',
        size: 'short',
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
        size: 'short',
        description: 'Reconstruction of the full respiratory flow with contactless impedance sensing and machine learning. This closes the gap to real flow measurement in sensitive clinical areas.',
        descriptionDe: 'Rekonstruktion des vollständigen Atemflusses mit kontaktloser Impedanzmessung und Machine Learning. Das schließt die Lücke zur echten Flussmessung in sensiblen klinischen Bereichen.',
        details: 'This work shows that the contactless, impedance-based sensor system (Thoraxmonitor) can reconstruct more than the respiratory rate. It reconstructs the complete respiratory flow quantitatively. Existing radar and camera technologies do not close the gap to real flow measurement. This method does. This has much potential for clinical areas where wired sensors or direct skin contact cause problems. An example is neonatology, where preterm infants need protection. The research shows practical use: simple machine learning methods are sufficient for an accurate mapping between the sensor signal and the real respiratory flow.',
        detailsDe: 'Diese Arbeit zeigt, dass das kontaktlose, impedanzbasierte Sensorsystem (Thoraxmonitor) mehr als die Atemfrequenz rekonstruieren kann. Es rekonstruiert den vollständigen Atemfluss quantitativ. Bestehende Radar- und Kameratechnologien schließen die Lücke zur echten Flussmessung nicht. Dieser Ansatz schon. Das hat großes Potenzial für klinische Bereiche, in denen kabelgebundene Sensoren oder direkter Hautkontakt Probleme machen. Ein Beispiel ist die Neonatologie, wo Frühgeborene Schutz brauchen. Die Arbeit zeigt den praktischen Nutzen: Einfache Methoden des maschinellen Lernens reichen für eine genaue Abbildung zwischen Sensorsignal und tatsächlichem Atemfluss.',
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
        description: 'A patent for the contactless measurement of physiological processes with electromagnetic fields and AI models. Currently in the application phase.',
        descriptionDe: 'Ein Patent zur kontaktlosen Vermessung physiologischer Abläufe mit elektromagnetischen Wechselfeldern und KI-Modellen. Derzeit in der Anmeldephase.',
        details: 'This patent (EP4504045A1) describes a method and an apparatus to measure processes in an object. It covers the core technology. The system transmits electromagnetic alternating fields and receives the modulated signals. Statistical models, specifically neural networks, then reconstruct vital parameters such as respiratory flow or cardiac activity. This happens in real time and without skin contact. The patent is currently in the application phase.',
        detailsDe: 'Dieses Patent (EP4504045A1) beschreibt ein Verfahren und eine Vorrichtung zur Vermessung von Abläufen in einem Objekt. Es umfasst die Kerntechnologie. Das System strahlt elektromagnetische Wechselfelder ein und empfängt die modulierten Signale. Statistische Modelle, insbesondere neuronale Netze, rekonstruieren daraus Vitalparameter wie Atemfluss oder Herzaktivität. Das geschieht in Echtzeit und ohne Hautkontakt. Das Patent befindet sich derzeit in der Anmeldephase.',
        category: 'publication',
        orientation: 'landscape',
        size: 'short',
        tech: ['Patent Law', 'Signal Processing', 'AI', 'Electromagnetics'],
        image: '/images/European-Patent-Office-Logo-Vector.svg-.webp',
        links: {
            paper: 'https://patents.google.com/patent/EP4504045A1/de'
        }
    },
    {
        id: 'homelab-cm3588',
        title: 'CM3588 NAS Homelab',
        titleDe: 'CM3588 NAS Homelab',
        role: 'System Architect',
        roleDe: 'Systemarchitekt',
        description: 'A high-performance, ARM-based NAS with 8 TB NVMe in RAID6. It self-hosts my complete home infrastructure, with secure access through Cloudflare.',
        descriptionDe: 'Ein leistungsstarkes, ARM-basiertes NAS mit 8 TB NVMe im RAID6. Es hostet meine komplette Heim-Infrastruktur, mit sicherem Zugriff über Cloudflare.',
        details: 'I built a custom, energy-efficient NAS based on the Rockchip RK3588 (CM3588) with 16 GB RAM. Four NVMe SSDs in RAID6 give fast storage with redundancy (8 TB in total). OpenMediaVault manages the software stack. It runs these Docker services: Immich for photos, Home Assistant for automation, AdGuard for DNS filtering, and Stirling PDF. A Cloudflare Zero Trust tunnel gives secure remote access, without open local ports.',
        detailsDe: 'Ich habe ein eigenes, energieeffizientes NAS auf Basis des Rockchip RK3588 (CM3588) mit 16 GB RAM gebaut. Vier NVMe-SSDs im RAID6 bieten schnellen Speicher mit Redundanz (8 TB gesamt). OpenMediaVault verwaltet den Software-Stack. Darauf laufen diese Docker-Dienste: Immich für Fotos, Home Assistant für Automatisierung, AdGuard für DNS-Filterung und Stirling PDF. Ein Cloudflare Zero Trust Tunnel ermöglicht sicheren Fernzugriff ohne offene lokale Ports.',
        category: 'sidequest',
        orientation: 'landscape',
        size: 'short',
        tech: ['RK3588', 'RAID6', 'Docker', 'Cloudflare Zero Trust', 'OpenMediaVault'],
        image: '/images/cm3588plus.webp',
        links: {
            external: 'https://www.friendlyelec.com/index.php?route=product/product&product_id=294'
        }
    }
];
