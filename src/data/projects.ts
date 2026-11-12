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
        description: 'I led the development of a contactless respiratory sensor as Product Owner. It uses UHF sensing to measure changes inside the lungs, through clothing, and reconstruct the breathing signal with machine learning.',
        descriptionDe: 'Als Product Owner habe ich die Entwicklung eines kontaktlosen Atemsensors geleitet. Er erfasst mit UHF-Technik Veränderungen im Inneren der Lunge, auch durch Kleidung, und rekonstruiert das Atemsignal mit Machine Learning.',
        details: 'As Product Owner, I led the development of the Thoraxmonitor, a contactless system for respiratory monitoring. It uses a 433 MHz UHF field to detect changes in the dielectric properties of the lungs as their air volume changes. The measurement works through clothing and does not require a sensor on the skin.\n\nThat gives us a different signal from a camera or radar tracking movement at the body surface. We use neural networks to reconstruct respiratory flow from the measurements in real time, with results comparable to clinical reference devices. My work brought product development together with sensing, signal processing, and the question of how this could be useful in clinical settings.',
        detailsDe: 'Als Product Owner habe ich die Entwicklung des Thoraxmonitors geleitet, eines kontaktlosen Systems zur Atemüberwachung. Ein UHF-Feld mit 433 MHz erfasst, wie sich die dielektrischen Eigenschaften der Lunge mit ihrem Luftvolumen ändern. Die Messung funktioniert durch Kleidung und braucht keinen Sensor auf der Haut.\n\nDas liefert ein anderes Signal als Kameras oder Radar, die Bewegungen an der Körperoberfläche verfolgen. Mit neuronalen Netzen rekonstruieren wir daraus den Atemfluss in Echtzeit, mit Ergebnissen, die mit klinischen Referenzgeräten vergleichbar sind. Meine Arbeit verband Produktentwicklung, Sensorik und Signalverarbeitung mit der Frage, wie sich das Verfahren im klinischen Umfeld nutzen lässt.',
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
        description: 'I developed DARIAN to bring patient information and clinical guidelines into the same conversation. The RAG system runs inside hospital infrastructure, using Docker microservices and patient data in the FHIR format.',
        descriptionDe: 'Ich habe DARIAN entwickelt, um Patienteninformationen und klinische Leitlinien in einem Gespräch zusammenzubringen. Das RAG-System läuft innerhalb der Klinikinfrastruktur, mit Docker-Microservices und Patientendaten im FHIR-Format.',
        details: 'I developed DARIAN, a medical co-pilot that combines patient information with clinical reference material. It uses retrieval-augmented generation (RAG) to work with real-time patient data in the FHIR format and verified guidance such as S3 guidelines and standard operating procedures. The aim is to give clinical decision support with a clear connection to its sources.\n\nI designed and built the system as a modular set of Docker microservices. It supports one-click deployment on hospital servers and is built for on-premise operation. Sensitive patient data stays within the hospital infrastructure. This project brought together the application itself, the data interfaces, and the architecture needed to run it in that environment.',
        detailsDe: 'Ich habe DARIAN entwickelt, einen medizinischen Co-Piloten, der Patienteninformationen mit klinischem Referenzmaterial verbindet. Retrieval-Augmented Generation (RAG) bringt aktuelle Patientendaten im FHIR-Format mit geprüften Quellen zusammen, darunter S3-Leitlinien und Standardarbeitsanweisungen. Das Ziel ist eine klinische Entscheidungshilfe, deren Bezug zu den Quellen nachvollziehbar bleibt.\n\nIch habe das System als modulare Anwendung aus Docker-Microservices entworfen und entwickelt. Es unterstützt die Installation per Klick auf Klinikservern und ist für den On-Premise-Betrieb gebaut. Sensible Patientendaten bleiben innerhalb der Klinikinfrastruktur. Das Projekt verband für mich die Anwendung, ihre Datenschnittstellen und die Architektur für den Betrieb in diesem Umfeld.',
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
        description: 'I co-authored a study of 8,104 cardiac CT scans from eight hospitals. We used federated learning and knowledge distillation to train models for multiple cardiac findings while keeping raw patient data at each hospital.',
        descriptionDe: 'Ich bin Co-Autor einer Studie mit 8.104 Herz-CT-Aufnahmen aus acht Krankenhäusern. Mit föderiertem Lernen und Knowledge Distillation trainierten wir Modelle für mehrere kardiale Befunde, während die Rohdaten in den jeweiligen Kliniken blieben.',
        details: 'I co-authored this study of 8,104 cardiac CT scans from eight hospitals, published in npj Digital Medicine. It is the largest federated cardiac CT analysis described in the original work. Each hospital trains models locally, so the study can use data from several institutions without collecting their raw patient scans in one place.\n\nThe method uses semi-supervised knowledge distillation to transfer learned representations from convolutional neural networks into transformers. The models learn to identify multiple cardiac findings in the same scan. The paper reports state-of-the-art results for detecting cardiac pathologies. The project connects two parts of my research: learning from medical images and working across hospitals while keeping patient data local.',
        detailsDe: 'Ich bin Co-Autor dieser Studie mit 8.104 Herz-CT-Aufnahmen aus acht Krankenhäusern, veröffentlicht in npj Digital Medicine. Die Originalarbeit beschreibt sie als bisher größte föderierte Herz-CT-Analyse. Jede Klinik trainiert Modelle vor Ort. So lassen sich Daten mehrerer Einrichtungen nutzen, ohne ihre rohen Patientenaufnahmen an einem Ort zu sammeln.\n\nDie Methode nutzt semi-überwachte Knowledge Distillation, um gelernte Repräsentationen aus Convolutional Neural Networks in Transformer zu übertragen. Die Modelle lernen, mehrere kardiale Befunde in derselben Aufnahme zu erkennen. Das Paper berichtet Spitzenleistungen bei der Erkennung kardialer Pathologien. Das Projekt verbindet zwei Teile meiner Forschung: das Lernen aus medizinischen Bildern und die Zusammenarbeit zwischen Kliniken bei lokal verbleibenden Patientendaten.',
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
        description: 'This is the website you are looking at. I built it with TypeScript, Bun, and plain CSS: one page for my work, a filterable git-style timeline, and a WebGL background with a little grain.',
        descriptionDe: 'Das ist die Webseite, die du gerade ansiehst. Ich habe sie mit TypeScript, Bun und reinem CSS gebaut: eine Seite für meine Arbeit, eine filterbare Timeline im Git-Stil und ein WebGL-Hintergrund mit etwas Körnung.',
        details: 'I built this site from scratch with TypeScript, Bun, and plain CSS. The page brings my projects, publications, and career history together without a frontend framework. Project cards open a longer set of notes, and the timeline has separate branches for work, education, research, and personal projects. You can filter those branches to follow one part of the story.\n\nI also wrote the visual details: the WebGL background, moving grain, custom cursor, and light and dark themes. Serif headings and monospace labels give the page its shape. Bun handles development and production builds. The source is on GitHub if you want to see how the page works.',
        detailsDe: 'Ich habe diese Seite von Grund auf mit TypeScript, Bun und reinem CSS gebaut. Sie bringt Projekte, Publikationen und meinen Werdegang ohne Frontend-Framework zusammen. Projektkarten öffnen ausführlichere Notizen. Die Timeline hat eigene Zweige für Beruf, Ausbildung, Forschung und persönliche Projekte. Diese Zweige lassen sich filtern, um einen Teil des Werdegangs zu verfolgen.\n\nAuch die visuellen Details habe ich selbst geschrieben: WebGL-Hintergrund, bewegte Körnung, eigener Cursor sowie heller und dunkler Modus. Serifenüberschriften und Monospace-Beschriftungen prägen das Bild. Bun übernimmt Entwicklung und Produktions-Builds. Der Quellcode liegt auf GitHub, falls du sehen möchtest, wie die Seite funktioniert.',
        category: 'sidequest',
        orientation: 'landscape',
        size: 'short',
        tech: ['TypeScript', 'Bun', 'CSS'],
        image: '/images/portfolio-current.png',
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
        description: 'In this first-author paper, I studied how to reconstruct the full respiratory flow from contactless impedance measurements. The work goes beyond counting breaths and examines the signal needed for quantitative flow measurement.',
        descriptionDe: 'In dieser Erstautor-Publikation habe ich untersucht, wie sich der vollständige Atemfluss aus kontaktlosen Impedanzmessungen rekonstruieren lässt. Die Arbeit geht über das Zählen von Atemzügen hinaus und untersucht das Signal für eine quantitative Flussmessung.',
        details: 'In this first-author paper, I investigated whether the Thoraxmonitor could reconstruct the full respiratory flow from contactless impedance measurements. Respiratory rate tells us how often someone breathes. Reconstructing flow means recovering the changing signal throughout the breath, which asks more of both the sensor and the model.\n\nThe work shows that relatively simple machine learning methods can map the sensor signal to the measured respiratory flow accurately. It addresses a gap left by contactless approaches that track surface movement. Neonatology is a potential application: skin contact and wired sensors can be difficult for premature infants. The paper studies the sensing and reconstruction method; it does not establish routine clinical use in that setting.',
        detailsDe: 'In dieser Erstautor-Publikation habe ich untersucht, ob der Thoraxmonitor den vollständigen Atemfluss aus kontaktlosen Impedanzmessungen rekonstruieren kann. Die Atemfrequenz sagt, wie oft jemand atmet. Für den Atemfluss muss dagegen der veränderliche Signalverlauf über den gesamten Atemzug rekonstruiert werden. Das stellt höhere Anforderungen an Sensor und Modell.\n\nDie Arbeit zeigt, dass vergleichsweise einfache Machine-Learning-Verfahren das Sensorsignal genau auf den gemessenen Atemfluss abbilden können. Sie adressiert eine Lücke kontaktloser Ansätze, die Oberflächenbewegungen verfolgen. Die Neonatologie ist ein mögliches Anwendungsfeld, weil Hautkontakt und kabelgebundene Sensoren bei Frühgeborenen schwierig sein können. Das Paper untersucht die Mess- und Rekonstruktionsmethode; es belegt keinen klinischen Routineeinsatz in diesem Umfeld.',
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
        description: 'I co-invented the sensing method behind the Thoraxmonitor. The patent application describes how electromagnetic fields and learned signal models can reconstruct physiological processes without direct skin contact.',
        descriptionDe: 'Ich bin Miterfinder des Messverfahrens hinter dem Thoraxmonitor. Die Patentanmeldung beschreibt, wie elektromagnetische Felder und gelernte Signalmodelle physiologische Abläufe ohne direkten Hautkontakt rekonstruieren können.',
        details: 'I co-invented the method described in patent application EP4504045A1. It covers a method and apparatus for measuring processes inside an object and forms the core technology behind the Thoraxmonitor. The system sends electromagnetic alternating fields into the object and receives signals that change with the process being measured.\n\nStatistical models, including neural networks, map those signals to physiological parameters such as respiratory flow or cardiac activity. The measurement works in real time and without skin contact. The application brings the sensing hardware and the signal reconstruction method together. It is still in the application phase; I list it here as a patent application, not a granted patent.',
        detailsDe: 'Ich bin Miterfinder des in der Patentanmeldung EP4504045A1 beschriebenen Verfahrens. Die Anmeldung umfasst ein Verfahren und eine Vorrichtung zur Messung von Abläufen innerhalb eines Objekts und bildet die Kerntechnologie des Thoraxmonitors. Das System sendet elektromagnetische Wechselfelder in das Objekt und empfängt Signale, die sich mit dem gemessenen Ablauf verändern.\n\nStatistische Modelle, darunter neuronale Netze, bilden diese Signale auf physiologische Parameter wie Atemfluss oder Herzaktivität ab. Die Messung erfolgt in Echtzeit und ohne Hautkontakt. Die Anmeldung verbindet die Sensorhardware mit der Signalrekonstruktion. Sie befindet sich weiterhin in der Anmeldephase; hier steht deshalb eine Patentanmeldung und kein erteiltes Patent.',
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
        title: 'Personal Homelab',
        titleDe: 'Persönliches Homelab',
        role: 'System Architect',
        roleDe: 'Systemarchitekt',
        description: 'My place to learn self-hosting by running services I use at home. Photos, home automation, and network tools make storage, maintenance, and backup part of the project rather than an exercise on paper.',
        descriptionDe: 'Hier lerne ich Self-Hosting mit Diensten, die ich zu Hause nutze. Fotos, Heimautomatisierung und Netzwerk-Tools machen Speicher, Wartung und Backup zu einem Teil des Projekts, statt einer Übung auf dem Papier.',
        details: 'I started the homelab as a place to learn self-hosting, storage, and network tools. It now runs services for things I use at home, including a photo library, home automation, and network filtering. Working on something I use gives the experiments a practical purpose and makes maintaining the services part of the project.\n\nThe photo library runs on Immich on my own server. I own and control the storage without a recurring cloud-storage subscription, and running it myself means taking care of capacity, maintenance, and running costs. I know the library was in use by January 2025, although I do not have an exact date for the first installation. The image on this card is an illustrative montage, not a live view of my dashboard or library, and my own photos stay out of the portfolio.\n\nHome Assistant brings everyday controls into one app. It connects products from different vendors across lighting, power, cleaning, and media, so I can build automations across integrations instead of switching between the separate apps for each product. My earlier experiments started around 2025. In September 2026, I brought that work into the setup for my new home.\n\nThat includes the less visible work around the apps. I use network segmentation to separate connected devices, self-hosted services, and everyday computing. An encrypted off-site backup supports a 3-2-1 backup strategy and protects the confidentiality of the copies. The homelab keeps growing through these projects, with storage and upkeep staying my responsibility.',
        detailsDe: 'Ich habe das Homelab als Ort zum Lernen von Self-Hosting, Speicher und Netzwerk-Tools begonnen. Heute laufen dort Dienste für Dinge, die ich zu Hause nutze, darunter eine Fotobibliothek, Heimautomatisierung und Netzwerkfilterung. An etwas zu arbeiten, das ich nutze, gibt den Experimenten einen praktischen Zweck. Auch die Pflege der Dienste gehört damit zum Projekt.\n\nDie Fotobibliothek läuft mit Immich auf meinem eigenen Server. Ich besitze und kontrolliere den Speicher ohne wiederkehrendes Cloud-Speicher-Abo, und der eigene Betrieb bedeutet, mich um Kapazität, Wartung und Betriebskosten zu kümmern. Ich weiß, dass die Bibliothek spätestens im Januar 2025 im Einsatz war. Ein genaues Datum für die erste Installation habe ich nicht. Das Bild auf dieser Karte ist eine illustrative Montage und kein Live-Blick auf mein Dashboard oder meine Bibliothek. Meine eigenen Fotos bleiben aus dem Portfolio heraus.\n\nHome Assistant bringt alltägliche Steuerungen in einer App zusammen. Er verbindet Produkte verschiedener Anbieter aus Beleuchtung, Strom, Reinigung und Medien. So kann ich über Integrationen hinweg automatisieren, ohne zwischen den einzelnen Produkt-Apps zu wechseln. Meine früheren Experimente begannen ungefähr 2025. Im September 2026 floss diese Arbeit in den Aufbau für mein neues Zuhause ein.\n\nDazu zählt die weniger sichtbare Arbeit rund um die Anwendungen. Netzwerksegmentierung trennt verbundene Geräte, selbst gehostete Dienste und die alltägliche Nutzung. Ein verschlüsseltes Offsite-Backup unterstützt eine 3-2-1-Backup-Strategie und schützt die Vertraulichkeit der Kopien. Das Homelab wächst mit diesen Projekten weiter. Speicher und laufender Betrieb bleiben meine Verantwortung.',
        category: 'sidequest',
        orientation: 'landscape',
        size: 'short',
        tech: ['Self-Hosting', 'Storage', 'Docker', 'Immich', 'Home Assistant'],
        image: '/images/personal-homelab.png'
    },
    {
        id: 'local-assistant',
        title: 'Local Agent',
        titleDe: 'Lokaler Agent',
        description: 'I run a personal Hermes agent and reach it through Open WebUI on my phone. I use it for questions, documents, and remote programming, with a choice of model providers and visibility into usage costs.',
        descriptionDe: 'Ich betreibe einen persönlichen Hermes-Agenten und greife über Open WebUI auf dem Handy darauf zu. Ich nutze ihn für Fragen, Dokumente und Programmieren aus der Ferne, mit Modellanbieterauswahl und Einblick in die Nutzungskosten.',
        details: 'I run a personal Hermes agent on my own server and connect it to Open WebUI. On my phone, Open WebUI is installed as a progressive web app, so I can reach the agent when I am away from my desk. I ask it questions, work with my documents, and use it to program or debug remotely. I keep developing the setup as I find more uses for it.\n\nOpenRouter lets me choose between model providers and see token usage and costs. The agent runs on my server, while model requests can go to external providers. Those requests may include prompts, tool results, or excerpts from my documents. I keep that distinction in mind when choosing what to send through it.',
        detailsDe: 'Ich betreibe einen persönlichen Hermes-Agenten auf meinem eigenen Server und verbinde ihn mit Open WebUI. Auf dem Handy ist Open WebUI als Progressive Web App installiert. So erreiche ich den Agenten auch abseits meines Schreibtischs. Ich stelle Fragen, arbeite mit meinen Dokumenten und nutze ihn zum Programmieren oder Debuggen aus der Ferne. Den Aufbau entwickle ich weiter, wenn ich neue Einsatzmöglichkeiten finde.\n\nÜber OpenRouter wähle ich zwischen Modellanbietern und sehe Tokenverbrauch und Kosten. Der Agent läuft auf meinem Server, während Modellanfragen an externe Anbieter gehen können. Diese Anfragen können Prompts, Tool-Ergebnisse oder Auszüge aus meinen Dokumenten enthalten. Diese Unterscheidung ist für mich wichtig, wenn ich entscheide, was ich darüber sende.',
        category: 'sidequest',
        orientation: 'landscape',
        size: 'short',
        tech: ['AI Agents', 'Hermes', 'Open WebUI', 'OpenRouter', 'Self-Hosting'],
        image: '/images/local-assistant.png'
    }
];
