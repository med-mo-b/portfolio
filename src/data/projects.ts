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
    description: string;
    descriptionDe: string;
    details: string;
    detailsDe: string;
    category: 'project' | 'publication' | 'experiment';
    size?: 'normal' | 'tall' | 'short';
    tech: string[];
    image: string;
    links?: {
        github?: string;
        external?: string;
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
        description: 'Contactless monitoring system for neonatology. Impedance-based measurement for quantitative respiratory flow reconstruction.',
        descriptionDe: 'Kontaktloses Monitoring-System für Neonatologie. Impedanzbasierte Messung zur quantitativen Atemfluss-Rekonstruktion.',
        details: 'A contactless monitoring system designed specifically for neonatology applications. The system uses impedance-based measurement techniques to provide quantitative respiratory flow reconstruction, bridging the gap to real flow measurement for clinical applications. This innovative approach enables non-invasive monitoring of neonatal patients, reducing the need for direct contact sensors that can be uncomfortable or pose infection risks. The technology has been developed in collaboration with medical professionals to ensure clinical viability and accuracy.',
        detailsDe: 'Ein kontaktloses Monitoring-System, das speziell für neonatologische Anwendungen entwickelt wurde. Das System nutzt impedanzbasierte Messverfahren zur quantitativen Atemfluss-Rekonstruktion und schließt die Lücke zur echten Flow-Messung für klinische Anwendungen. Dieser innovative Ansatz ermöglicht die nicht-invasive Überwachung von Neugeborenen und reduziert den Bedarf an direkten Kontaktsensoren, die unangenehm sein oder Infektionsrisiken darstellen können. Die Technologie wurde in Zusammenarbeit mit medizinischen Fachkräften entwickelt, um klinische Durchführbarkeit und Genauigkeit zu gewährleisten.',
        category: 'project',
        size: 'tall',
        tech: ['Python', 'ML', 'Sensors', 'Signal Processing'],
        image: '/images/thoraxmonitor.png',
        links: {
            external: 'https://gesundheitstechnologien.ipa.fraunhofer.de/de/unsere_projekte/thoraxmonitor.html'
        }
    },
    {
        id: 'tedias-ahead',
        title: 'TEDIAS & AHEAD',
        titleDe: 'TEDIAS & AHEAD',
        description: 'RAG chatbots and AI systems for medical data integration. Dockerized solutions for secure medical data processing with large language models.',
        descriptionDe: 'RAG-Chatbots und KI-Systeme für medizinische Datenintegration. Dockerisierte Lösungen für sichere medizinische Datenverarbeitung mit Large Language Models.',
        details: 'TEDIAS and AHEAD are comprehensive RAG (Retrieval-Augmented Generation) chatbot systems designed for medical data integration and secure processing. These systems leverage large language models to provide intelligent interfaces for medical professionals, enabling natural language queries over complex medical datasets. The solutions are fully dockerized for easy deployment and scalability, with built-in security measures to ensure HIPAA compliance and data privacy. The architecture supports multiple data sources and can be customized for various medical domains.',
        detailsDe: 'TEDIAS und AHEAD sind umfassende RAG-Chatbot-Systeme (Retrieval-Augmented Generation) für medizinische Datenintegration und sichere Verarbeitung. Diese Systeme nutzen Large Language Models, um intelligente Schnittstellen für medizinische Fachkräfte bereitzustellen und natürliche Sprachabfragen über komplexe medizinische Datensätze zu ermöglichen. Die Lösungen sind vollständig dockerisiert für einfache Bereitstellung und Skalierbarkeit, mit eingebauten Sicherheitsmaßnahmen zur Gewährleistung von HIPAA-Compliance und Datenschutz. Die Architektur unterstützt mehrere Datenquellen und kann für verschiedene medizinische Domänen angepasst werden.',
        category: 'project',
        tech: ['Docker', 'RAG', 'LLMs', 'Python'],
        image: '/images/TEDIAS.jpg',
        links: {
            external: 'https://gesundheitstechnologien.ipa.fraunhofer.de/de/unsere_projekte/rag-chatbot.html'
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
        tech: ['TypeScript', 'Bun', 'CSS'],
        image: 'https://placehold.co/600x350/1a1a1e/FFF',
        links: {
            github: 'https://github.com/moritzbednorz/portfolio'
        }
    }
];
