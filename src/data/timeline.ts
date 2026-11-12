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
        description: 'I joined osapiens as an AI Platform Engineer, working full-time in a hybrid role in Mannheim, Baden-Württemberg, Germany. I run and develop the internal AI platform beyond its first pilot phase. My work includes the infrastructure and helping engineering and product teams use AI in their development workflows. I also connect those teams with leadership on the AI strategy.',
        descriptionDe: 'Ich bin als AI Platform Engineer bei osapiens eingestiegen, in Vollzeit und hybrid in Mannheim, Baden-Württemberg, Deutschland. Ich betreibe und entwickle die interne KI-Plattform über ihre erste Pilotphase hinaus. Dazu gehören die Infrastruktur und die Arbeit mit Engineering- und Produktteams, die KI in ihren Entwicklungsabläufen nutzen. Bei der KI-Strategie verbinde ich diese Teams mit der Führung.',
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
        id: 'local-assistant',
        date: 'Nov 2026',
        dateDe: 'Nov 2026',
        year: 2026,
        month: 11,
        branch: 'homelabbing',
        title: 'Local Agent',
        titleDe: 'Lokaler Agent',
        description: 'I connected my Hermes agent to Open WebUI and installed the web interface as a progressive web app on my phone. That gives me access for questions, documents, and programming or debugging when I am away from my desk. OpenRouter provides model choice and usage-cost visibility.',
        descriptionDe: 'Ich habe meinen Hermes-Agenten mit Open WebUI verbunden und die Weboberfläche als Progressive Web App auf dem Handy installiert. Damit kann ich auch abseits des Schreibtischs Fragen stellen, mit Dokumenten arbeiten und programmieren oder debuggen. OpenRouter bietet Modellauswahl und Einblick in die Nutzungskosten.',
        tags: ['AI Agents', 'Hermes', 'Open WebUI', 'OpenRouter'],
        icon: 'robot',
        projectId: 'local-assistant'
    },
    {
        id: 'encrypted-backup',
        date: 'Oct 2026',
        dateDe: 'Okt 2026',
        year: 2026,
        month: 10,
        branch: 'homelabbing',
        title: 'Encrypted Off-Site Backup',
        titleDe: 'Verschlüsseltes Offsite-Backup',
        description: 'I added an encrypted off-site backup for my personal data. Keeping copies away from home is part of the 3-2-1 strategy I am working toward, and encryption protects their confidentiality. This sits alongside the storage work in my homelab. It is a backup milestone, not a claim that every recovery scenario has been tested.',
        descriptionDe: 'Ich habe ein verschlüsseltes Offsite-Backup für meine persönlichen Daten ergänzt. Kopien außerhalb des Zuhauses gehören zur 3-2-1-Strategie, die ich verfolge. Die Verschlüsselung schützt ihre Vertraulichkeit. Das ergänzt die Arbeit am Speicher im Homelab. Der Eintrag beschreibt einen Backup-Meilenstein, keine Aussage darüber, dass jeder Wiederherstellungsfall getestet wurde.',
        tags: ['Backup', 'Encryption', '3-2-1 Strategy'],
        icon: 'server',
        projectId: 'homelab-cm3588'
    },
    {
        id: 'network-segmentation',
        date: 'Sep 2026',
        dateDe: 'Sep 2026',
        year: 2026,
        month: 9,
        branch: 'homelabbing',
        title: 'Network Segmentation',
        titleDe: 'Netzwerksegmentierung',
        description: 'I added UniFi network segmentation to the homelab. Connected devices, self-hosted services, and everyday computing are separate areas to manage. This made the network itself part of the project, alongside the applications and storage. The public description stays at that level and leaves the actual configuration out.',
        descriptionDe: 'Ich habe das Homelab um UniFi-Netzwerksegmentierung ergänzt. Verbundene Geräte, selbst gehostete Dienste und die alltägliche Nutzung bilden getrennte Bereiche. Damit gehört auch das Netzwerk selbst zum Projekt, neben Anwendungen und Speicher. Die öffentliche Beschreibung bleibt auf dieser Ebene und lässt die konkrete Konfiguration aus.',
        tags: ['UniFi', 'Segmentation', 'Self-Hosting'],
        icon: 'drafting',
        projectId: 'homelab-cm3588'
    },
    {
        id: 'home-automation',
        date: 'Sep 2026',
        dateDe: 'Sep 2026',
        year: 2026,
        month: 9,
        branch: 'homelabbing',
        title: 'Home Automation',
        titleDe: 'Heimautomatisierung',
        description: 'I set up Home Assistant for my new home, bringing earlier experiments from around 2025 into one setup. It connects products from different vendors, so I can manage everyday functions in one app and automate across integrations. The work is about making those products work together, without depending on a separate app for each one.',
        descriptionDe: 'Ich habe Home Assistant für mein neues Zuhause eingerichtet und frühere Experimente aus der Zeit um 2025 in einem Aufbau zusammengebracht. Er verbindet Produkte verschiedener Anbieter. So kann ich alltägliche Funktionen in einer App verwalten und über Integrationen hinweg automatisieren. Dabei geht es darum, die Produkte gemeinsam zu nutzen, ohne für jedes eine eigene App zu brauchen.',
        tags: ['Home Assistant', 'Cross-Platform Integration'],
        icon: 'cogs',
        projectId: 'homelab-cm3588'
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
        description: 'I co-authored a study of 8,104 cardiac CT scans from eight hospitals, published in npj Digital Medicine. The work combines federated learning with semi-supervised knowledge distillation from convolutional networks into transformers. It trains models for multiple cardiac findings while raw patient scans stay at their hospitals. The original study describes the largest federated cardiac CT analysis at that point.',
        descriptionDe: 'Ich bin Co-Autor einer Studie mit 8.104 Herz-CT-Aufnahmen aus acht Krankenhäusern, veröffentlicht in npj Digital Medicine. Die Arbeit verbindet föderiertes Lernen mit semi-überwachter Knowledge Distillation von Faltungsnetzen in Transformer. Sie trainiert Modelle für mehrere kardiale Befunde, während die Rohdaten in den Kliniken bleiben. Die Originalstudie beschreibt die zu diesem Zeitpunkt größte föderierte Herz-CT-Analyse.',
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
        description: 'I built this portfolio to bring my projects, publications, and career history onto one page. It uses TypeScript, Bun, and plain CSS, with a git-style timeline that separates the different parts of my journey. I also wrote the WebGL background, grain, and custom cursor. The site is another project I keep working on alongside the things it documents.',
        descriptionDe: 'Ich habe dieses Portfolio gebaut, um Projekte, Publikationen und meinen Werdegang auf einer Seite zusammenzubringen. Es nutzt TypeScript, Bun und reines CSS. Die Timeline im Git-Stil trennt die verschiedenen Teile meines Werdegangs. Auch WebGL-Hintergrund, Körnung und eigener Cursor stammen von mir. Die Seite ist selbst ein Projekt, an dem ich neben den hier dokumentierten Dingen weiterarbeite.',
        tags: ['Bun', 'TypeScript', 'CSS'],
        icon: 'drafting',
        projectId: 'portfolio-website'
    },
    {
        id: 'private-photo-library',
        date: 'Jan 2025',
        dateDe: 'Jan 2025',
        year: 2025,
        month: 1,
        branch: 'homelabbing',
        title: 'Private Photo Library',
        titleDe: 'Private Fotobibliothek',
        description: 'My Immich photo library was in use by January 2025; the surviving records support that date, but not an exact first installation day. I run the library on my own server and control the storage without a recurring cloud-storage subscription. Capacity, maintenance, and running costs stay with me, as part of the homelab.',
        descriptionDe: 'Meine Immich-Fotobibliothek war spätestens im Januar 2025 im Einsatz. Die erhaltenen Aufzeichnungen belegen diesen Zeitpunkt, aber keinen genauen ersten Installationstag. Ich betreibe die Bibliothek auf meinem eigenen Server und kontrolliere den Speicher ohne wiederkehrendes Cloud-Speicher-Abo. Kapazität, Wartung und Betriebskosten liegen bei mir, als Teil des Homelabs.',
        tags: ['Immich', 'Self-Hosting', 'Photo Management'],
        icon: 'image',
        projectId: 'homelab-cm3588'
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
        description: 'I published my first-author work on reconstructing respiratory flow from contactless impedance measurements with the Thoraxmonitor. The paper examines the full flow signal, beyond respiratory rate, and shows that simple machine learning methods can map the sensor measurements to real flow. Neonatology is a potential application where avoiding wired sensors and skin contact matters.',
        descriptionDe: 'Ich habe meine Erstautor-Arbeit zur Rekonstruktion des Atemflusses aus kontaktlosen Impedanzmessungen mit dem Thoraxmonitor veröffentlicht. Das Paper untersucht den vollständigen Flussverlauf über die Atemfrequenz hinaus. Es zeigt, dass einfache Machine-Learning-Verfahren die Sensormessungen auf den tatsächlichen Atemfluss abbilden können. Die Neonatologie ist ein mögliches Anwendungsfeld, in dem das Vermeiden kabelgebundener Sensoren und direkten Hautkontakts wichtig ist.',
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
        description: 'I worked as a Research Engineer at Fraunhofer IPA, full-time in a hybrid role in Mannheim, Baden-Württemberg, Germany. My work crossed medical sensing, machine learning, and the software needed to connect them. I led interdisciplinary teams, developed sensor and AI concepts, and worked on funding, publications, and patents. Projects included contactless respiratory monitoring and clinical RAG systems.',
        descriptionDe: 'Ich habe als Forschungsingenieur am Fraunhofer IPA gearbeitet, in Vollzeit und hybrid in Mannheim, Baden-Württemberg, Deutschland. Meine Arbeit verband medizinische Sensorik, Machine Learning und die Software dazwischen. Ich leitete interdisziplinäre Teams, entwickelte Sensor- und KI-Konzepte und arbeitete an Finanzierung, Publikationen und Patenten. Zu den Projekten gehörten die kontaktlose Atemüberwachung und klinische RAG-Systeme.',
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
        description: 'I completed my M.Sc. in Medical Informatics at Heidelberg University with a grade of 1.2. My studies focused on data science, computer-aided diagnosis, and therapy systems. The degree brought the medical and computational parts of my work together, alongside my research on learning from medical data.',
        descriptionDe: 'Ich habe meinen M.Sc. in Medizinischer Informatik an der Universität Heidelberg mit der Note 1,2 abgeschlossen. Schwerpunkte waren Data Science, computergestützte Diagnose und Therapiesysteme. Das Studium brachte die medizinischen und informatischen Teile meiner Arbeit zusammen, parallel zu meiner Forschung zum Lernen aus medizinischen Daten.',
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
        description: 'For my master thesis at University Hospital Heidelberg, I developed Bayesian federated learning methods for selecting transcatheter aortic valve prostheses. The work combined a clinical selection problem with methods for learning across data sources. It connected with my research on uncertainty in medical AI and my work with PyTorch.',
        descriptionDe: 'Für meine Masterarbeit am Universitätsklinikum Heidelberg habe ich Methoden des bayesschen föderierten Lernens zur Auswahl von Transkatheter-Aortenklappenprothesen entwickelt. Die Arbeit verband eine klinische Auswahlfrage mit Verfahren zum Lernen über Datenquellen hinweg. Sie knüpfte an meine Forschung zur Unsicherheit in medizinischer KI und meine Arbeit mit PyTorch an.',
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
        description: 'In the AICM group at University Hospital Heidelberg, I worked on AI for cardiovascular medicine. I used deep learning and PyTorch, with a focus on uncertainty quantification and knowledge distillation. These methods also appear in my later work on federated cardiac CT analysis.',
        descriptionDe: 'In der AICM-Gruppe am Universitätsklinikum Heidelberg habe ich an KI für die kardiovaskuläre Medizin gearbeitet. Ich nutzte Deep Learning und PyTorch, mit Schwerpunkt auf Unsicherheitsquantifizierung und Knowledge Distillation. Diese Methoden finden sich auch in meiner späteren Arbeit zur föderierten Herz-CT-Analyse wieder.',
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
        title: 'Personal Homelab',
        titleDe: 'Persönliches Homelab',
        description: 'I started my homelab as a place to learn self-hosting, storage, and network tools by running things myself. It grew into the base for my personal projects, including photo management and home automation. As the services became part of what I use at home, storage, maintenance, and backup became part of the work too.',
        descriptionDe: 'Ich habe mein Homelab begonnen, um Self-Hosting, Speicher und Netzwerk-Tools durch den eigenen Betrieb zu lernen. Daraus wurde die Grundlage für meine persönlichen Projekte, darunter Fotoverwaltung und Heimautomatisierung. Mit den Diensten, die ich zu Hause nutze, wurden auch Speicher, Wartung und Backup zu einem Teil der Arbeit.',
        tags: ['Self-Hosting', 'Storage', 'Docker'],
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
        description: 'I co-invented the sensing method behind the Thoraxmonitor. The patent application describes how electromagnetic fields and statistical models can measure processes inside an object, including physiological signals without skin contact. The German and European filings are part of that research work. The patent remains in the application phase.',
        descriptionDe: 'Ich bin Miterfinder des Messverfahrens hinter dem Thoraxmonitor. Die Patentanmeldung beschreibt, wie elektromagnetische Felder und statistische Modelle Abläufe im Inneren eines Objekts messen können, darunter physiologische Signale ohne Hautkontakt. Die deutsche und die europäische Anmeldung gehören zu dieser Forschungsarbeit. Das Patent befindet sich weiterhin in der Anmeldephase.',
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
        description: 'I analyzed aortic valves in CT images at University Hospital Heidelberg, using deep learning in PyTorch. The project combined medical imaging with cardiovascular research, a subject I continued in my master thesis on selecting aortic valve prostheses.',
        descriptionDe: 'Am Universitätsklinikum Heidelberg habe ich Aortenklappen auf CT-Aufnahmen mit Deep Learning in PyTorch analysiert. Das Projekt verband medizinische Bildgebung mit kardiovaskulärer Forschung. Das Thema führte ich in meiner Masterarbeit zur Auswahl von Aortenklappenprothesen weiter.',
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
        description: 'I continued working in medical-technology research at Fraunhofer IPA during my master studies. This followed my bachelor thesis there on machine learning for cardiorespiratory patterns. The graduate research assistant role kept my studies connected to research work before I later joined as a Research Engineer.',
        descriptionDe: 'Während meines Masterstudiums habe ich meine medizintechnische Forschungsarbeit am Fraunhofer IPA fortgesetzt. Zuvor hatte ich dort meine Bachelorarbeit zu Machine Learning für kardiorespiratorische Muster geschrieben. Als wissenschaftliche Hilfskraft blieb mein Studium mit der Forschung verbunden, bevor ich später als Forschungsingenieur einstieg.',
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
        description: 'I completed my B.Eng. in Medical Engineering at TH Ulm, with a focus on medical electronics and software development. That combination runs through my later work on sensors and medical AI. My bachelor thesis at Fraunhofer IPA examined machine learning methods for recognizing cardiorespiratory patterns.',
        descriptionDe: 'Ich habe meinen B.Eng. in Medizintechnik an der TH Ulm abgeschlossen, mit Schwerpunkten in Medizinelektronik und Softwareentwicklung. Diese Verbindung zieht sich durch meine spätere Arbeit an Sensoren und medizinischer KI. In meiner Bachelorarbeit am Fraunhofer IPA untersuchte ich Machine-Learning-Verfahren zur Erkennung kardiorespiratorischer Muster.',
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
        description: 'For my bachelor thesis at Fraunhofer IPA, I validated machine learning methods for recognizing and classifying cardiorespiratory patterns. The work connected signal processing with medical sensing. It was an early part of the research thread that later continued in my work on contactless respiratory monitoring.',
        descriptionDe: 'Für meine Bachelorarbeit am Fraunhofer IPA habe ich Machine-Learning-Verfahren zur Erkennung und Klassifikation kardiorespiratorischer Muster validiert. Die Arbeit verband Signalverarbeitung mit medizinischer Sensorik. Sie war ein früher Teil der Forschungsrichtung, die ich später mit der kontaktlosen Atemüberwachung fortgesetzt habe.',
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
        description: 'I spent an exchange semester at SNUST in Seoul, South Korea, during my engineering studies. My focus there was data science and Python. The semester gave that part of my studies a setting outside Germany, before I continued with medical-data research.',
        descriptionDe: 'Während meines Ingenieurstudiums habe ich ein Auslandssemester an der SNUST in Seoul, Südkorea, verbracht. Meine Schwerpunkte dort waren Data Science und Python. Dieser Teil des Studiums fand damit außerhalb Deutschlands statt, bevor ich mich weiter mit der Forschung an medizinischen Daten beschäftigte.',
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
        description: 'My research internship at Fraunhofer IPA included Android development for surgical robots, work with microcontrollers, and deep reinforcement learning. It brought software and physical systems into the same set of projects. I later returned to Fraunhofer for my bachelor thesis and continued working there during my master studies.',
        descriptionDe: 'Mein Forschungspraktikum am Fraunhofer IPA umfasste Android-Entwicklung für Chirurgieroboter, die Arbeit mit Mikrocontrollern und Deep Reinforcement Learning. Dabei trafen Software und physische Systeme aufeinander. Später kehrte ich für meine Bachelorarbeit zu Fraunhofer zurück und setzte die Arbeit dort während meines Masterstudiums fort.',
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
        description: 'At Beikirch, I planned electrical installations for large construction projects, including Alter Wall in Hamburg. I worked with CAD in technical system planning. This was the electrical-planning part of my career, before my focus shifted to medical technology and software.',
        descriptionDe: 'Bei Beikirch habe ich Elektroinstallationen für große Bauprojekte geplant, darunter Alter Wall in Hamburg. In der technischen Systemplanung arbeitete ich mit CAD. Das war der elektroplanerische Teil meines Berufswegs, bevor mein Schwerpunkt zu Medizintechnik und Software wechselte.',
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
        description: 'I completed my apprenticeship with the R+S Group in the field of electrical systems. I received an IHK award for the best examination result in my occupational group. I later continued working with electrical systems in technical planning at Beikirch.',
        descriptionDe: 'Ich habe meine Ausbildung bei der R+S Group im Bereich elektrischer Systeme abgeschlossen. Für die beste Prüfungsleistung in meiner Berufsgruppe erhielt ich eine IHK-Auszeichnung. Später arbeitete ich bei Beikirch in der technischen Planung weiter mit elektrischen Systemen.',
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
        description: 'I earned my technical college entrance qualification at Ferdinand-Braun-Schule, with a focus on mechanical engineering. It was the school qualification before my B.Eng. in Medical Engineering at TH Ulm. Mechanical design, electrical systems, and software all became part of my technical background.',
        descriptionDe: 'Ich habe an der Ferdinand-Braun-Schule die Fachhochschulreife mit Schwerpunkt Maschinenbau erworben. Das war der schulische Abschluss vor meinem B.Eng. in Medizintechnik an der TH Ulm. Mechanische Konstruktion, elektrische Systeme und Software wurden Teile meines technischen Hintergrunds.',
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
        description: 'At Wassermann Technologie, I worked on CNC tool-changing systems during a mechanical-engineering internship. My tasks included design and assembly, so the work covered both drawing the systems and putting them together. It was an early practical introduction to mechanical engineering.',
        descriptionDe: 'Bei Wassermann Technologie habe ich während eines Maschinenbaupraktikums an CNC-Werkzeugwechselsystemen gearbeitet. Zu meinen Aufgaben gehörten Konstruktion und Montage, also sowohl das Entwerfen als auch das Zusammenbauen der Systeme. Das war ein früher praktischer Einblick in den Maschinenbau.',
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
