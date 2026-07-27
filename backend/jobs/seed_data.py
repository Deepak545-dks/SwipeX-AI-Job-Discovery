# seed_data.py

COMPANIES_SEED_INFO = {
    "Google": {
        "website": "https://careers.google.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
        "description": "Google's mission is to organize the world's information and make it universally accessible and useful.",
        "company_type": "mnc",
        "industry": "Internet & Software Services",
        "employee_count": 180000,
        "headquarters": "Mountain View, CA",
        "founded_year": 1998,
        "jobs": [
            {
                "title": "Senior Software Engineer - Search Core Infrastructure",
                "description": "Build high-throughput search indexing pipelines and low-latency storage systems at global scale.",
                "requirements": "5+ years of experience in C++, Go, or Python.\nExpertise in distributed database patterns.",
                "salary_min": 160000, "salary_max": 240000, "location": "Mountain View, CA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["Go", "C++", "Distributed Systems", "Linux"]
            },
            {
                "title": "Frontend Engineer - Google Workspace Suite",
                "description": "Develop premium glassmorphic client application screens for Google Docs, Slides, and Sheets.",
                "requirements": "Proficient with modern React, TypeScript, and CSS variables.\nStrong eye for micro-animations.",
                "salary_min": 120000, "salary_max": 180000, "location": "New York, NY", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["React", "TypeScript", "CSS3", "HTML5"]
            },
            {
                "title": "Machine Learning Scientist - Google DeepMind",
                "description": "Research next-generation transformer structures, LLM optimizations, and reinforcement models.",
                "requirements": "Ph.D. in Computer Science or Mathematics.\nStrong publication history in NeurIPS/ICML.",
                "salary_min": 190000, "salary_max": 310000, "location": "London, UK", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "lead",
                "skills": ["Python", "PyTorch", "TensorFlow", "AI Research"]
            },
            {
                "title": "Site Reliability Engineer - Cloud Platforms",
                "description": "Maintain maximum uptime and continuous integration configurations for Google Cloud virtual container clusters.",
                "requirements": "Strong scripting skills in Go, Python, or Bash.\nDeep knowledge of Kubernetes.",
                "salary_min": 115000, "salary_max": 170000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Go", "Python", "Kubernetes", "Docker"]
            },
            {
                "title": "Product Manager II - Android Security",
                "description": "Define product specifications and roadmap metrics for Google Play Protect and security sandboxes.",
                "requirements": "3+ years of technical product management experience.\nFamiliarity with mobile operating systems.",
                "salary_min": 130000, "salary_max": 195000, "location": "Mountain View, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Product Management", "Mobile Design", "Security Policies"]
            },
            {
                "title": "Security Analyst - Chrome Sandbox Security",
                "description": "Perform penetration tests, vulnerability audits, and containment checks for browser processes.",
                "requirements": "Experience with binary exploitation and kernel-level fuzzing tools.\nKnowledge of C++.",
                "salary_min": 145000, "salary_max": 220000, "location": "Remote, US", "job_type": "remote",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["C++", "Assembly", "Rust", "Cybersecurity"]
            },
            {
                "title": "Data Analyst - YouTube Monetization System",
                "description": "Build data pipelines, visual dashboard trackers, and statistical algorithms to optimize advertiser match performance.",
                "requirements": "Proficiency in SQL, Python, and Tableau dashboards.\nStrong business analytical logic.",
                "salary_min": 90000, "salary_max": 135000, "location": "San Bruno, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["SQL", "Python", "Tableau", "Pandas"]
            },
            {
                "title": "UX Researcher - Google Search UX",
                "description": "Lead user research sessions, synthesize qualitative metrics, and optimize layout alignments.",
                "requirements": "Portfolio detailing complete customer journey mapping and user feedback pipelines.",
                "salary_min": 105000, "salary_max": 160000, "location": "Mountain View, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Figma", "UI/UX", "User Research"]
            },
            {
                "title": "Technical Writer - Firebase Documentation",
                "description": "Draft tutorials, package references, and starter templates for mobile serverless platforms.",
                "requirements": "Experience writing code samples in JavaScript, Python, or Swift.\nClear writing capabilities.",
                "salary_min": 80000, "salary_max": 120000, "location": "Remote, US", "job_type": "remote",
                "employment_type": "contract", "experience_level": "junior",
                "skills": ["JavaScript", "Firebase", "Technical Writing"]
            },
            {
                "title": "Database Administrator - AdSense Analytics",
                "description": "Optimize indexes, resolve deadlocks, and structure query pipelines for high-throughput databases.",
                "requirements": "Deep understanding of relational database administration and schema modeling.",
                "salary_min": 125000, "salary_max": 185000, "location": "New York, NY", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["SQL", "Postgres", "Database Design", "NoSQL"]
            },
            {
                "title": "Developer Relations Specialist - Google Maps API",
                "description": "Represent Google at technical hackathons, write open-source samples, and create video explainers.",
                "requirements": "Strong communication capabilities.\nExperience building map integrations with React or Android.",
                "salary_min": 110000, "salary_max": 165000, "location": "London, UK", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["React", "JavaScript", "Google Maps", "Public Speaking"]
            },
            {
                "title": "System Engineering Intern - Linux kernel optimization",
                "description": "Profile driver latency, compile custom kernels, and assist in CPU utilization improvements.",
                "requirements": "Enrolled in Computer Science degrees.\nBasic experience with C programming.",
                "salary_min": 60000, "salary_max": 90000, "location": "Sunnyvale, CA", "job_type": "onsite",
                "employment_type": "internship", "experience_level": "fresher",
                "skills": ["C", "Linux", "System Architecture"]
            }
        ]
    },
    "Microsoft": {
        "website": "https://careers.microsoft.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
        "description": "Microsoft enables digital transformation for the era of an intelligent cloud and an intelligent edge.",
        "company_type": "mnc",
        "industry": "Enterprise Software & Cloud Platforms",
        "employee_count": 220000,
        "headquarters": "Redmond, WA",
        "founded_year": 1975,
        "jobs": [
            {
                "title": "Cloud Solutions Architect - Azure Enterprise",
                "description": "Architect high-availability cloud migration profiles, networking interfaces, and security configurations for enterprise clients.",
                "requirements": "Azure certification (AZ-305 or equivalent).\nExperience migrating enterprise clusters to cloud endpoints.",
                "salary_min": 155000, "salary_max": 230000, "location": "Redmond, WA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["Azure", "Cloud Architecture", "Networking", "Security Policies"]
            },
            {
                "title": "Core Windows OS Developer - Kernel team",
                "description": "Optimize microkernel architectures, storage virtualization systems, and process threading performance.",
                "requirements": "Strong programming background in C++, assembly languages, and Windows Internals.",
                "salary_min": 170000, "salary_max": 260000, "location": "Redmond, WA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["C++", "OS Development", "Assembly", "C"]
            },
            {
                "title": "Software Engineer II - Microsoft Teams",
                "description": "Implement WebRTC calling engines, audio codecs, and chat interfaces for scaling collaborative apps.",
                "requirements": "3+ years of software design experience.\nExpertise in TypeScript and React.",
                "salary_min": 115000, "salary_max": 175000, "location": "Dublin, Ireland", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["React", "TypeScript", "WebRTC", "JavaScript"]
            },
            {
                "title": "Security Analyst - Azure Threat Intelligence",
                "description": "Identify malware models, trace network anomalies, and secure platform nodes against zero-day vulnerabilities.",
                "requirements": "Strong skills in cryptography and reverse engineering.",
                "salary_min": 130000, "salary_max": 200000, "location": "Remote, US", "job_type": "remote",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Cybersecurity", "Python", "Linux", "Azure"]
            },
            {
                "title": "DevOps Engineer - Azure Pipelines Core",
                "description": "Build high-throughput CI/CD templates, deploy pipeline runners, and optimize compilation environments.",
                "requirements": "Experience with Git, GitHub Actions, Docker, and shell scripting.",
                "salary_min": 120000, "salary_max": 180000, "location": "Redmond, WA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Docker", "Kubernetes", "DevOps", "Shell Scripting"]
            },
            {
                "title": "Data Scientist - Xbox Live Recommendation Engine",
                "description": "Model user game preferences, build predictive models, and optimize social recommendations.",
                "requirements": "Knowledge of statistical modeling, SQL, Python, and PyTorch.",
                "salary_min": 135000, "salary_max": 190000, "location": "Redmond, WA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Python", "SQL", "PyTorch", "Data Science"]
            },
            {
                "title": "Program Manager I - Dynamics 365 Operations",
                "description": "Coordinate development cycles, trace sprint metrics, and align customer feedback pipelines.",
                "requirements": "Basic project management skills.\nExcellent coordination capabilities.",
                "salary_min": 85000, "salary_max": 125000, "location": "Hyderabad, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["Agile", "Scrum", "Jira"]
            },
            {
                "title": "Technical Consultant - Power Platform",
                "description": "Help enterprise clients configure automation pipelines and build custom low-code tools.",
                "requirements": "Experience with Microsoft database architectures, relational schemas, and PowerApps.",
                "salary_min": 95000, "salary_max": 140000, "location": "London, UK", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["SQL", "PowerApps", "Consulting", "JavaScript"]
            },
            {
                "title": "Lead Software Engineer - Office Online Web App",
                "description": "Oversee the transition of core Office editors to rich progressive web architectures.",
                "requirements": "8+ years in frontend development.\nProven record of scaling highly collaborative web systems.",
                "salary_min": 190000, "salary_max": 280000, "location": "Redmond, WA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "lead",
                "skills": ["TypeScript", "React", "Web Performance", "System Design"]
            },
            {
                "title": "Research Intern - Microsoft Research AI",
                "description": "Develop and document novel training paradigms for code generation and multi-modal models.",
                "requirements": "Graduate student in CS or AI domains.\nStrong foundations in linear algebra.",
                "salary_min": 70000, "salary_max": 95000, "location": "Remote, US", "job_type": "remote",
                "employment_type": "internship", "experience_level": "fresher",
                "skills": ["Python", "PyTorch", "AI Research"]
            },
            {
                "title": "Systems Administrator - Azure AD Active Directory",
                "description": "Audit corporate access policies, define single-sign-on (SSO) pathways, and troubleshoot server networks.",
                "requirements": "Experience administering Windows Servers, Active Directory, and DNS systems.",
                "salary_min": 100000, "salary_max": 150000, "location": "Redmond, WA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Active Directory", "Networking", "Windows Server"]
            },
            {
                "title": "Junior Developer - Visual Studio Code team",
                "description": "Implement UI improvements, address open-source tracker items, and update code editor tools.",
                "requirements": "Basic programming background.\nExperience writing custom VS Code plugins.",
                "salary_min": 95000, "salary_max": 135000, "location": "Redmond, WA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["TypeScript", "Node.js", "VS Code", "Git"]
            }
        ]
    },
    "Amazon": {
        "website": "https://amazon.jobs",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
        "description": "Amazon is guided by four principles: customer obsession, passion for invention, commitment to operational excellence, and long-term thinking.",
        "company_type": "mnc",
        "industry": "E-commerce & Cloud Services",
        "employee_count": 1500000,
        "headquarters": "Seattle, WA",
        "founded_year": 1994,
        "jobs": [
            {
                "title": "AWS Solutions Architect - Enterprise Cloud",
                "description": "Design secure, serverless cloud hosting solutions utilizing Lambda, ECS, DynamoDB, and CloudFront.",
                "requirements": "AWS Solutions Architect Professional certification.\nDeep expertise in infrastructure design.",
                "salary_min": 160000, "salary_max": 235000, "location": "Seattle, WA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["AWS", "Cloud Architecture", "NoSQL", "Serverless"]
            },
            {
                "title": "Software Development Engineer II - Prime Video Core",
                "description": "Build high-throughput media encoding microservices and video streaming delivery APIs.",
                "requirements": "3+ years of experience in Java, Go, or Python.\nProven record of scaling high-availability systems.",
                "salary_min": 135000, "salary_max": 195000, "location": "London, UK", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Java", "Go", "Distributed Systems", "Web Performance"]
            },
            {
                "title": "Frontend Engineer - Amazon Retail Web App",
                "description": "Improve browser load metrics, create modern product displays, and refine checking pipelines.",
                "requirements": "Experience with modern React, JavaScript modules, and page performance instrumentation.",
                "salary_min": 110000, "salary_max": 165000, "location": "Seattle, WA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["React", "JavaScript", "HTML5", "CSS3"]
            },
            {
                "title": "Logistics Operations Software Developer",
                "description": "Develop route optimization algorithms, inventory database trackers, and warehouse robot controls.",
                "requirements": "Strong skills in algorithms, graph databases, and Python/C++.",
                "salary_min": 125000, "salary_max": 185000, "location": "Arlington, VA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Python", "Algorithms", "C++", "SQL"]
            },
            {
                "title": "DevOps Engineer - AWS Internal Tooling",
                "description": "Deploy secure pipeline configurations, coordinate container networks, and scale server infrastructure.",
                "requirements": "Proficiency in CDK, CloudFormation, Docker, and script tools.",
                "salary_min": 118000, "salary_max": 175000, "location": "Vancouver, Canada", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Docker", "Kubernetes", "AWS", "CI/CD"]
            },
            {
                "title": "Data Analyst - Amazon Ads Attribution Team",
                "description": "Analyze multi-touch click events, model conversion performance, and draft SQL reports.",
                "requirements": "Proficiency in SQL, Python, Tableau dashboards, and statistcal logic.",
                "salary_min": 85000, "salary_max": 125000, "location": "Remote, US", "job_type": "remote",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["SQL", "Python", "Tableau", "Pandas"]
            },
            {
                "title": "Lead Database Engineer - DynamoDB Engine",
                "description": "Research low-latency file system optimizations, key-value storage designs, and transactional engines.",
                "requirements": "8+ years in database engines design.\nDeep knowledge of storage structures.",
                "salary_min": 185000, "salary_max": 290000, "location": "Seattle, WA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "lead",
                "skills": ["C++", "C", "Database Design", "Distributed Systems"]
            },
            {
                "title": "Product Manager - Amazon Web Services (EKS)",
                "description": "Drive product definitions, developer interfaces, and enterprise packaging for Elastic Kubernetes Services.",
                "requirements": "Technical background in containers and microservices.\nPrior product management experience.",
                "salary_min": 145000, "salary_max": 210000, "location": "Seattle, WA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["Product Management", "Kubernetes", "Docker", "Cloud Platforms"]
            },
            {
                "title": "Junior QA Automation Engineer - Alexa Devices",
                "description": "Create python scripts, write system tests, and report hardware hardware faults.",
                "requirements": "Basic scripting knowledge.\nExperience with automated web testing tools like Selenium.",
                "salary_min": 80000, "salary_max": 115000, "location": "Chennai, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["Python", "QA Testing", "Selenium", "Git"]
            },
            {
                "title": "Machine Learning Engineer - Alexa NLU Engine",
                "description": "Optimize deep learning models for natural language understanding and spoken intent parsing.",
                "requirements": "Experience deploying machine learning models to production servers.\nPython/PyTorch skills.",
                "salary_min": 150000, "salary_max": 220000, "location": "Seattle, WA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Python", "PyTorch", "Machine Learning", "NLP"]
            },
            {
                "title": "Cloud Migration Architect - Public Sector",
                "description": "Plan secure hosting solutions and network policies for state and municipal agencies.",
                "requirements": "Must meet security clearance qualifications.\nExperience in public sector systems.",
                "salary_min": 140000, "salary_max": 205000, "location": "Arlington, VA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["AWS", "Networking", "Cybersecurity", "Compliance"]
            },
            {
                "title": "Web Development Intern - Seller Central portal",
                "description": "Assist in building merchant dashboards, writing CSS adjustments, and improving tables.",
                "requirements": "Familiarity with HTML, CSS, JavaScript, and standard React pipelines.",
                "salary_min": 55000, "salary_max": 80000, "location": "Remote, US", "job_type": "remote",
                "employment_type": "internship", "experience_level": "fresher",
                "skills": ["React", "JavaScript", "HTML5", "CSS3"]
            }
        ]
    },
    "Adobe": {
        "website": "https://adobe.com/careers",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Adobe_Inc._logo.svg",
        "description": "Adobe is the global leader in digital media and digital marketing solutions.",
        "company_type": "mnc",
        "industry": "Creative Software & Cloud",
        "employee_count": 29000,
        "headquarters": "San Jose, CA",
        "founded_year": 1982,
        "jobs": [
            {
                "title": "Senior Graphics Engineer - Photoshop Web App",
                "description": "Optimize browser WebGL canvas layers, WASM compilation modules, and hardware drawing execution.",
                "requirements": "Experience with WebGL, WebGPU, WebAssembly, and C++.",
                "salary_min": 150000, "salary_max": 230000, "location": "San Jose, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["C++", "WebGL", "WebAssembly", "Graphics"]
            },
            {
                "title": "Frontend Engineer - Creative Cloud Dashboard",
                "description": "Build premium glassmorphic UI components, sidebars, and asset catalog lists.",
                "requirements": "3+ years of React and TypeScript development experience.\nFamiliarity with state management libraries.",
                "salary_min": 115000, "salary_max": 170000, "location": "Noida, India", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["React", "TypeScript", "HTML5", "CSS3"]
            },
            {
                "title": "ML Engineer - Firefly Generative AI Models",
                "description": "Build diffusion architectures, optimize image generation pipelines, and structure model weights.",
                "requirements": "Strong machine learning credentials.\nExperience training models in PyTorch.",
                "salary_min": 160000, "salary_max": 245000, "location": "San Jose, CA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Python", "PyTorch", "Generative AI", "Machine Learning"]
            },
            {
                "title": "SRE Engineer - Adobe Experience Manager Cloud",
                "description": "Manage database replication schedules, auto-scaling scripts, and serverless architectures.",
                "requirements": "Experience with AWS, Docker, Kubernetes, and terraform tools.",
                "salary_min": 120000, "salary_max": 180000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["AWS", "Kubernetes", "Terraform", "Docker"]
            },
            {
                "title": "Data Analyst - Creative Cloud Analytics",
                "description": "Assemble data queries, build dashboard panels, and evaluate cohort retention factors.",
                "requirements": "Skills in SQL, Python, Tableau, and cohort grouping analysis.",
                "salary_min": 90000, "salary_max": 130000, "location": "Remote, US", "job_type": "remote",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["SQL", "Python", "Tableau", "Pandas"]
            },
            {
                "title": "Lead Systems Architect - Document Cloud (Acrobat)",
                "description": "Design modular, low-latency microservice architectures and PDF signature endpoints.",
                "requirements": "8+ years in systems engineering.\nProven history of migrating monolith APIs.",
                "salary_min": 180000, "salary_max": 270000, "location": "San Jose, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "lead",
                "skills": ["Java", "Distributed Systems", "API Design", "System Design"]
            },
            {
                "title": "Technical Program Manager - Creative SDK",
                "description": "Align external developers roadmap items, organize sprint intervals, and report release metrics.",
                "requirements": "Technical background.\nStrong communication and sprint coordination skills.",
                "salary_min": 125000, "salary_max": 185000, "location": "San Jose, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["Agile", "Scrum", "Jira"]
            },
            {
                "title": "Junior Developer - Adobe Fonts Web Integration",
                "description": "Optimize CSS file caching networks, browser font-face styling, and loading speed.",
                "requirements": "Basic programming background.\nProficient with CSS typography rules.",
                "salary_min": 85000, "salary_max": 120000, "location": "Noida, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["CSS3", "JavaScript", "Web Performance", "Git"]
            },
            {
                "title": "Security Analyst - Creative Cloud Storage Sec",
                "description": "Perform network packet analysis, configure IAM profiles, and build threat protection scripts.",
                "requirements": "Experience with network protocols, cloud access controllers, and Linux administration.",
                "salary_min": 110000, "salary_max": 165000, "location": "Remote, US", "job_type": "remote",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Cybersecurity", "Networking", "Linux", "AWS"]
            },
            {
                "title": "UX Designer - Premiere Pro Web Panel",
                "description": "Draft timeline wireframes, coordinate video playback buttons layout, and test responsiveness.",
                "requirements": "Stunning design portfolio showcasing clean typography and pixel-perfect layouts.",
                "salary_min": 100000, "salary_max": 150000, "location": "San Jose, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Figma", "UI/UX", "Mobile Design"]
            },
            {
                "title": "QA Automation Engineer - Acrobat Sign Tool",
                "description": "Build integration test scripts, trace server latency, and configure test runner networks.",
                "requirements": "Experience writing automated script suites with Python and Cypress.",
                "salary_min": 105000, "salary_max": 155000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Python", "Cypress", "QA Testing", "Git"]
            },
            {
                "title": "Software Engineering Intern - WebGPU research",
                "description": "Implement basic shaders, test frame rendering metrics, and write proof-of-concepts.",
                "requirements": "Enrolled in scientific engineering degree.\nStrong interest in computer graphics.",
                "salary_min": 65000, "salary_max": 90000, "location": "San Jose, CA", "job_type": "onsite",
                "employment_type": "internship", "experience_level": "fresher",
                "skills": ["WebGL", "JavaScript", "C++"]
            }
        ]
    },
    "Atlassian": {
        "website": "https://atlassian.com/careers",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/0/01/Atlassian_Logo.svg",
        "description": "Atlassian unleashes the potential in every team. Our collaboration software helps teams organize, discuss, and complete shared work.",
        "company_type": "mnc",
        "industry": "Team Collaboration Software",
        "employee_count": 11000,
        "headquarters": "Sydney, Australia",
        "founded_year": 2002,
        "jobs": [
            {
                "title": "Senior Backend Developer - Jira Cloud Platform",
                "description": "Scale core relational database layouts and speed up API response latency for millions of concurrent projects.",
                "requirements": "5+ years developing microservices in Java or Kotlin.\nProficiency with relational database structures.",
                "salary_min": 140000, "salary_max": 210000, "location": "Sydney, Australia", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["Java", "SQL", "API Design", "Distributed Systems"]
            },
            {
                "title": "Frontend Engineer - Confluence Page Editor",
                "description": "Redesign rich text editor integrations, optimize content autosave events, and improve rendering speeds.",
                "requirements": "3+ years of React and JavaScript development experience.\nFamiliarity with web workers and state layers.",
                "salary_min": 110000, "salary_max": 165000, "location": "San Francisco, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["React", "JavaScript", "Web Performance", "TypeScript"]
            },
            {
                "title": "Cloud Infrastructure Architect - AWS Platforms",
                "description": "Build landing zones, scale multi-tenant containers, and define network routing configurations.",
                "requirements": "Certifications in AWS and Terraform.\nDeep knowledge of distributed systems.",
                "salary_min": 150000, "salary_max": 225000, "location": "Remote, US", "job_type": "remote",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["AWS", "Terraform", "Kubernetes", "Cloud Architecture"]
            },
            {
                "title": "Data Scientist - Growth and Product Insights",
                "description": "Develop models to identify customer upgrade trigger thresholds and track user journeys.",
                "requirements": "Strong database query modeling skills.\nPython/Pandas data processing capabilities.",
                "salary_min": 120000, "salary_max": 175000, "location": "Sydney, Australia", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Python", "SQL", "Data Science", "Pandas"]
            },
            {
                "title": "SRE Engineer - Trello Core Infrastructure",
                "description": "Monitor system load averages, build auto-restart scripts, and secure cloud storage buckets.",
                "requirements": "Experience with Linux administration, shell scripting, and container networking.",
                "salary_min": 115000, "salary_max": 170000, "location": "Remote, US", "job_type": "remote",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Linux", "Docker", "DevOps", "Shell Scripting"]
            },
            {
                "title": "Product Designer - Jira Service Management",
                "description": "Draft customer service dashboards layouts, optimize support queues flows, and test layouts.",
                "requirements": "Stunning design catalog showcasing clean typography and glassmorphic design systems.",
                "salary_min": 105000, "salary_max": 150000, "location": "Sydney, Australia", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Figma", "UI/UX", "User Research"]
            },
            {
                "title": "Lead Software Engineer - Compass Developer Portal",
                "description": "Lead the team developing a unified dashboard to coordinate microservices directories.",
                "requirements": "8+ years in software engineering.\nPrior experience as a technical leader.",
                "salary_min": 175000, "salary_max": 260000, "location": "San Francisco, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "lead",
                "skills": ["TypeScript", "React", "Node.js", "System Design"]
            },
            {
                "title": "Security Specialist - Identity and Access Management",
                "description": "Configure single-sign-on (SSO) APIs, audit security policies, and secure data access nodes.",
                "requirements": "Knowledge of OAuth2, SAML, and secure token architectures.",
                "salary_min": 130000, "salary_max": 195000, "location": "Remote, US", "job_type": "remote",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Cybersecurity", "API Design", "Authentication Protocols"]
            },
            {
                "title": "Junior Systems Developer - Bitbucket APIs",
                "description": "Maintain git hooks servers, address pipeline errors, and write shell extensions.",
                "requirements": "Basic programming background.\nStrong knowledge of Git workflows.",
                "salary_min": 80000, "salary_max": 115000, "location": "Sydney, Australia", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["Git", "Python", "Linux", "API Design"]
            },
            {
                "title": "Developer Advocate - Atlassian Marketplace",
                "description": "Create sample integration plugins, speak at conferences, and write developer tutorials.",
                "requirements": "Strong communication and coding skills.\nActive in developer communities.",
                "salary_min": 110000, "salary_max": 160000, "location": "Remote, US", "job_type": "remote",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["JavaScript", "Node.js", "Public Speaking", "Technical Writing"]
            },
            {
                "title": "QA Automation Engineer - Confluence Cloud Team",
                "description": "Draft automated browser flow checks, trace server latency, and run continuous integrations.",
                "requirements": "Experience with Selenium or Cypress automation suites.",
                "salary_min": 100000, "salary_max": 145000, "location": "Sydney, Australia", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Cypress", "QA Testing", "Selenium", "Git"]
            },
            {
                "title": "Software Engineering Intern - Growth metrics integration",
                "description": "Implement feature flag indicators, trace usage logs, and write clean database queries.",
                "requirements": "Enrolled in computer science degrees.\nBasic knowledge of Python or JavaScript.",
                "salary_min": 60000, "salary_max": 85000, "location": "Remote, US", "job_type": "remote",
                "employment_type": "internship", "experience_level": "fresher",
                "skills": ["JavaScript", "Python", "Git"]
            }
        ]
    },
    "Netflix": {
        "website": "https://jobs.netflix.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
        "description": "Netflix is the world's leading streaming entertainment service with hundreds of millions of paid memberships.",
        "company_type": "mnc",
        "industry": "Media & Streaming Entertainment",
        "employee_count": 12000,
        "headquarters": "Los Gatos, CA",
        "founded_year": 1997,
        "jobs": [
            {
                "title": "Lead Software Engineer - Adaptive Video Streaming",
                "description": "Develop low-latency video streaming algorithms, optimize network packet sizes, and support real-time codecs.",
                "requirements": "8+ years in network protocols and media streaming.\nExpertise in C++ and JavaScript architectures.",
                "salary_min": 210000, "salary_max": 330000, "location": "Los Gatos, CA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "lead",
                "skills": ["C++", "JavaScript", "WebRTC", "Network Optimization"]
            },
            {
                "title": "Senior Frontend Developer - TV UI Interface",
                "description": "Optimize remote control navigation layouts, CSS animation frame rates, and render performance for smart TV apps.",
                "requirements": "5+ years of React development experience.\nDeep expertise in browser rendering cycles.",
                "salary_min": 160000, "salary_max": 250000, "location": "Los Gatos, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["React", "TypeScript", "Web Performance", "CSS3"]
            },
            {
                "title": "Machine Learning Engineer - Recommendation Pipeline",
                "description": "Train recommendation algorithms, structure user interaction vector matrices, and scale inference models.",
                "requirements": "Ph.D. or Master's in machine learning fields.\nStrong skills in Python and PyTorch.",
                "salary_min": 180000, "salary_max": 290000, "location": "Los Gatos, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["Python", "PyTorch", "Data Science", "Machine Learning"]
            },
            {
                "title": "Cloud Infrastructure Architect - Enterprise Infrastructure",
                "description": "Scale multi-tenant container networks across AWS cloud nodes, build custom tooling, and optimize storage costs.",
                "requirements": "AWS Certified DevOps Engineer or equivalent.\nExpertise in terraform and kubernetes.",
                "salary_min": 170000, "salary_max": 260000, "location": "Remote, US", "job_type": "remote",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["AWS", "Kubernetes", "Terraform", "Cloud Architecture"]
            },
            {
                "title": "Data Architect - Subscriber Analytics Engine",
                "description": "Design secure, highly indexed relational databases to process global subscription metrics.",
                "requirements": "Deep knowledge of relational database schema layouts and Postgres configurations.",
                "salary_min": 150000, "salary_max": 230000, "location": "Los Gatos, CA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["Postgres", "SQL", "Database Design", "NoSQL"]
            },
            {
                "title": "DevOps Specialist - Continuous Integration Tooling",
                "description": "Deploy secure build runners, coordinate container environments, and automate static code checks.",
                "requirements": "Experience with Docker, GitHub APIs, and shell script automation.",
                "salary_min": 130000, "salary_max": 195000, "location": "Los Gatos, CA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Docker", "DevOps", "CI/CD", "Shell Scripting"]
            },
            {
                "title": "Product Designer - Account Settings and Portals",
                "description": "Rebuild settings dashboards, integrate multi-factor security overlays, and test responsiveness.",
                "requirements": "Stunning design portfolio showcasing clean layouts and premium glassmorphic themes.",
                "salary_min": 115000, "salary_max": 170000, "location": "Amsterdam, Netherlands", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Figma", "UI/UX", "User Research"]
            },
            {
                "title": "Security Engineer - DRM Media Security",
                "description": "Audit decryption APIs, integrate digital rights management (DRM) policies, and trace network nodes.",
                "requirements": "Experience with browser security architectures and media encryption schemes.",
                "salary_min": 155000, "salary_max": 235000, "location": "Los Gatos, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["Cybersecurity", "API Design", "C++", "Linux"]
            },
            {
                "title": "Data Analyst - Content Performance analytics",
                "description": "Track video play dropoff rates, model content production costs, and build custom database charts.",
                "requirements": "Proficiency in SQL, Python, and BI reporting tools.",
                "salary_min": 95000, "salary_max": 140000, "location": "Remote, US", "job_type": "remote",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["SQL", "Python", "Tableau", "Pandas"]
            },
            {
                "title": "Junior Developer - Internal Tools Suite",
                "description": "Implement UI improvements, address backlog developer support tickets, and write basic scripts.",
                "requirements": "Basic programming background in Javascript and Python.\nActive collaborator.",
                "salary_min": 90000, "salary_max": 130000, "location": "Los Gatos, CA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["JavaScript", "React", "Python", "Git"]
            },
            {
                "title": "QA Automation Engineer - Core Player Team",
                "description": "Write end-to-end browser check scripts, profile player buffering, and test layouts.",
                "requirements": "Experience writing automated script suites with Javascript or Cypress.",
                "salary_min": 110000, "salary_max": 160000, "location": "Los Gatos, CA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Cypress", "QA Testing", "JavaScript", "Selenium"]
            },
            {
                "title": "Software Engineering Intern - Web Video optimization",
                "description": "Test adaptive streaming buffer margins, report browser crash statistics, and write clean tools.",
                "requirements": "Enrolled in computer science degrees.\nBasic knowledge of JavaScript and HTML5.",
                "salary_min": 65000, "salary_max": 95000, "location": "Los Gatos, CA", "job_type": "onsite",
                "employment_type": "internship", "experience_level": "fresher",
                "skills": ["JavaScript", "HTML5", "Git"]
            }
        ]
    },
    "Meta": {
        "website": "https://meta.com/careers",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
        "description": "Meta builds technologies that help people connect, find communities, and grow businesses.",
        "company_type": "mnc",
        "industry": "Social Media & XR Technologies",
        "employee_count": 67000,
        "headquarters": "Menlo Park, CA",
        "founded_year": 2004,
        "jobs": [
            {
                "title": "Senior Frontend Developer - Instagram Feed Web App",
                "description": "Optimize image loading metrics, design dynamic blur image placeholders, and speed up interaction feeds.",
                "requirements": "5+ years of React and JavaScript development experience.\nDeep expertise in bundle size reduction.",
                "salary_min": 155000, "salary_max": 240000, "location": "Menlo Park, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["React", "TypeScript", "Web Performance", "JavaScript"]
            },
            {
                "title": "Software Engineer II - Threads Core Backend",
                "description": "Implement high-throughput API endpoints, optimize distributed caches, and design database queries.",
                "requirements": "3+ years of experience in Python, C++, or Go.\nExperience building highly concurrent web systems.",
                "salary_min": 130000, "salary_max": 190000, "location": "London, UK", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Go", "Python", "API Design", "Distributed Systems"]
            },
            {
                "title": "ML Engineer - PyTorch Optimization team",
                "description": "Optimize GPU kernels, implement faster compilation hooks, and scale model training grids.",
                "requirements": "Strong machine learning foundations.\nExperience with C++ and PyTorch core.",
                "salary_min": 170000, "salary_max": 275000, "location": "Menlo Park, CA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["PyTorch", "Python", "C++", "Machine Learning"]
            },
            {
                "title": "DevOps Engineer - Infrastructure Platforms",
                "description": "Deploy secure container environments, configure static analysis rules, and optimize compilation chains.",
                "requirements": "Experience with Docker, Kubernetes, and shell scripting.",
                "salary_min": 120000, "salary_max": 180000, "location": "Menlo Park, CA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Docker", "Kubernetes", "CI/CD", "Linux"]
            },
            {
                "title": "Data Architect - Messaging Privacy Group",
                "description": "Design database schemas, audit access policies, and secure data migration endpoints.",
                "requirements": "Knowledge of relational databases, Postgres administrations, and secure access protocols.",
                "salary_min": 145000, "salary_max": 220000, "location": "Remote, US", "job_type": "remote",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["Postgres", "SQL", "Database Design", "Cybersecurity"]
            },
            {
                "title": "Data Analyst - Ad Campaign Performance",
                "description": "Evaluate cohort conversion rates, draft custom SQL reports, and audit statistical anomalies.",
                "requirements": "Proficiency in SQL, Python, and statistical modeling libraries.",
                "salary_min": 90000, "salary_max": 135000, "location": "Remote, US", "job_type": "remote",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["SQL", "Python", "Tableau", "Pandas"]
            },
            {
                "title": "Lead Software Engineer - VR Web Browser",
                "description": "Architect chromium core integrations, optimize visual frame rates, and support WebXR APIs.",
                "requirements": "8+ years in system level programming.\nDeep knowledge of computer graphics.",
                "salary_min": 190000, "salary_max": 300000, "location": "Menlo Park, CA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "lead",
                "skills": ["C++", "System Architecture", "WebGL", "System Design"]
            },
            {
                "title": "Product Manager - Meta Business Suite",
                "description": "Coordinate product roadmaps, organize feedback interviews, and analyze usage charts.",
                "requirements": "Technical background.\nProven technical product management experience.",
                "salary_min": 140000, "salary_max": 205000, "location": "Menlo Park, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["Product Management", "Agile", "Jira"]
            },
            {
                "title": "Junior QA Specialist - WhatsApp Web Client",
                "description": "Write automated end-to-end test cases, report bug logs, and verify browser layout safety.",
                "requirements": "Basic programming background.\nExperience writing Cypress or Selenium tests.",
                "salary_min": 85000, "salary_max": 125000, "location": "Menlo Park, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["Cypress", "QA Testing", "JavaScript", "Git"]
            },
            {
                "title": "Security Analyst - App Security Audits",
                "description": "Identify vulnerability vectors, audit third-party integrations, and write custom filters.",
                "requirements": "Experience with penetration tests and static application security testing (SAST) tools.",
                "salary_min": 125000, "salary_max": 185000, "location": "Menlo Park, CA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Cybersecurity", "Python", "API Design"]
            },
            {
                "title": "UX Designer - Threads Mobile Interface",
                "description": "Design clean typography layouts, micro-animations, and responsive profile pages.",
                "requirements": "Visual design portfolio showcasing modern glassmorphic dashboards.",
                "salary_min": 100000, "salary_max": 150000, "location": "Menlo Park, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Figma", "UI/UX", "Mobile Design"]
            },
            {
                "title": "Software Engineering Intern - Web Performance Group",
                "description": "Analyze CSS execution timings, compile report logs, and write clean script tools.",
                "requirements": "Enrolled in computer science degrees.\nFamiliarity with HTML, CSS, and JavaScript.",
                "salary_min": 60000, "salary_max": 90000, "location": "Menlo Park, CA", "job_type": "onsite",
                "employment_type": "internship", "experience_level": "fresher",
                "skills": ["JavaScript", "CSS3", "Git"]
            }
        ]
    },
    "Apple": {
        "website": "https://careers.apple.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
        "description": "Apple is committed to bringing the best personal computing experience to students, educators, creative professionals and consumers.",
        "company_type": "mnc",
        "industry": "Consumer Electronics & Digital Services",
        "employee_count": 164000,
        "headquarters": "Cupertino, CA",
        "founded_year": 1976,
        "jobs": [
            {
                "title": "Senior Systems Developer - iOS Core Services",
                "description": "Optimize low-latency system daemons, core frameworks execution speeds, and memory allocations.",
                "requirements": "5+ years in operating system developments.\nDeep knowledge of Objective-C, Swift, and C++.",
                "salary_min": 160000, "salary_max": 245000, "location": "Cupertino, CA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["Swift", "C++", "Objective-C", "OS Development"]
            },
            {
                "title": "Frontend Engineer - iCloud Web Interface",
                "description": "Rebuild iCloud web dashboards, integrate security authentication screens, and test layouts.",
                "requirements": "3+ years of React or Vue development experience.\nFamiliarity with web performance optimizations.",
                "salary_min": 115000, "salary_max": 170000, "location": "Austin, TX", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["React", "TypeScript", "JavaScript", "HTML5"]
            },
            {
                "title": "ML Engineer - Siri Speech Recognition Group",
                "description": "Train custom acoustic models, optimize voice command parsing, and deploy server inference containers.",
                "requirements": "Experience training natural language processing (NLP) architectures in PyTorch.",
                "salary_min": 150000, "salary_max": 230000, "location": "Cupertino, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Python", "PyTorch", "NLP", "Machine Learning"]
            },
            {
                "title": "SRE Engineer - Apple Pay Cloud Platform",
                "description": "Manage database replications schedules, configure auto-scaling rules, and protect network nodes.",
                "requirements": "Experience managing cloud clusters, writing Terraform files, and scripting.",
                "salary_min": 125000, "salary_max": 185000, "location": "Cupertino, CA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["AWS", "Docker", "Kubernetes", "DevOps"]
            },
            {
                "title": "Data Scientist - App Store Discovery Analytics",
                "description": "Analyze click metrics, design recommendation experiments, and build cohort reports.",
                "requirements": "Skills in SQL databases, Python, Pandas, and visual reporting tools.",
                "salary_min": 120000, "salary_max": 180000, "location": "Munich, Germany", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Python", "SQL", "Data Science", "Pandas"]
            },
            {
                "title": "Lead Software Engineer - WebKit browser engine",
                "description": "Lead the team optimizing layout algorithms, javascript compilation engines, and CSS parser compliance.",
                "requirements": "8+ years in systems programming.\nDeep understanding of WebKit architectures.",
                "salary_min": 190000, "salary_max": 290000, "location": "Cupertino, CA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "lead",
                "skills": ["C++", "C", "System Design", "Web Performance"]
            },
            {
                "title": "DevOps Engineer - internal build environments",
                "description": "Manage compiler toolchains, deploy container systems, and configure automated code check runners.",
                "requirements": "Experience with CI/CD tools, Shell scripts, and Linux administration.",
                "salary_min": 110000, "salary_max": 165000, "location": "Cupertino, CA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Linux", "Docker", "CI/CD", "Shell Scripting"]
            },
            {
                "title": "Junior Developer - Swift Standard Library",
                "description": "Optimize standard library API routines, address bug tickets, and write system tests.",
                "requirements": "Basic programming background.\nProficiency with Swift or C++.",
                "salary_min": 90000, "salary_max": 130000, "location": "Cupertino, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["Swift", "C++", "Git"]
            },
            {
                "title": "Product Designer - Apple Store App Interface",
                "description": "Design interactive checkout steps, custom graphics collections, and test layout scaling.",
                "requirements": "Visual design portfolio showcasing modern animations and typographic styles.",
                "salary_min": 105005, "salary_max": 155000, "location": "Cupertino, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Figma", "UI/UX", "User Research"]
            },
            {
                "title": "Security Specialist - Cryptography Protocols",
                "description": "Verify encryption keys protocols, audit database access layers, and configure secure firewalls.",
                "requirements": "Experience with security audits and OAuth/SAML token integrations.",
                "salary_min": 140000, "salary_max": 215000, "location": "Cupertino, CA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["Cybersecurity", "Networking", "Cryptography"]
            },
            {
                "title": "QA Automation Engineer - iCloud Drive Team",
                "description": "Draft automated file synchronization audits, test server latency, and configure build jobs.",
                "requirements": "Experience writing automated scripts with Python or JavaScript frameworks.",
                "salary_min": 100000, "salary_max": 145000, "location": "Austin, TX", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Python", "QA Testing", "Selenium", "Git"]
            },
            {
                "title": "Software Engineering Intern - compiler optimizations",
                "description": "Assist in testing custom compiler compiler branches, profiling runtimes, and writing reports.",
                "requirements": "Enrolled in computer engineering degrees.\nFamiliarity with compiler design.",
                "salary_min": 60000, "salary_max": 85000, "location": "Cupertino, CA", "job_type": "onsite",
                "employment_type": "internship", "experience_level": "fresher",
                "skills": ["C++", "Git", "Algorithms"]
            }
        ]
    },
    "Nvidia": {
        "website": "https://nvidia.com/careers",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg",
        "description": "Nvidia pioneered GPU-accelerated computing. It has transformed entertainment, scientific research, and AI.",
        "company_type": "mnc",
        "industry": "Semiconductors & AI Hardware",
        "employee_count": 26000,
        "headquarters": "Santa Clara, CA",
        "founded_year": 1993,
        "jobs": [
            {
                "title": "Senior Systems Developer - CUDA Compiler Infrastructure",
                "description": "Optimize GPU compiler passes, generate efficient hardware assembly codes, and speed up mathematical libraries.",
                "requirements": "5+ years in compiler design or LLVM development.\nExpertise in C++ and CUDA programming.",
                "salary_min": 170000, "salary_max": 260000, "location": "Santa Clara, CA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["C++", "CUDA", "LLVM", "Compiler Design"]
            },
            {
                "title": "Software Engineer II - TensorRT Deep Learning",
                "description": "Build high-performance deep learning inference layers, optimize model weights, and support diverse graphics nodes.",
                "requirements": "3+ years of software design experience.\nStrong Python and C++ skills.",
                "salary_min": 140050, "salary_max": 210000, "location": "Santa Clara, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Python", "C++", "TensorRT", "Machine Learning"]
            },
            {
                "title": "Frontend Engineer - Omniverse Web Platform",
                "description": "Develop modern glassmorphic web dashboards to configure 3D assets directories and collaborate real-time.",
                "requirements": "Experience with React, TypeScript, and WebGL drawing techniques.",
                "salary_min": 110000, "salary_max": 165000, "location": "Santa Clara, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["React", "TypeScript", "WebGL", "HTML5"]
            },
            {
                "title": "DevOps Engineer - GPU Cluster Operations",
                "description": "Scale container networks across high-performance compute clusters, configure build grids, and write script tools.",
                "requirements": "Experience with Docker, Kubernetes, Linux servers, and networking.",
                "salary_min": 125000, "salary_max": 185000, "location": "Hsinchu, Taiwan", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Docker", "Kubernetes", "DevOps", "Linux"]
            },
            {
                "title": "Data Analyst - Supply Chain Logistics",
                "description": "Structure supply databases, audit global manufacturing logs, and write custom SQL reports.",
                "requirements": "Proficiency in SQL, Python data libraries, and visual tools.",
                "salary_min": 95000, "salary_max": 135000, "location": "Santa Clara, CA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["SQL", "Python", "Tableau", "Pandas"]
            },
            {
                "title": "Lead Security Architect - Enterprise Networks",
                "description": "Design network firewall policies, verify single-sign-on (SSO) gateways, and secure server nodes.",
                "requirements": "8+ years in enterprise security auditing.\nExperience with network threat analysis.",
                "salary_min": 180000, "salary_max": 275000, "location": "Santa Clara, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "lead",
                "skills": ["Cybersecurity", "Networking", "System Design", "Active Directory"]
            },
            {
                "title": "SRE Specialist - AI Training Cloud Platform",
                "description": "Manage database replication schedules, check server uptime, and optimize auto-scaling routines.",
                "requirements": "Experience administering container clusters and script writing.",
                "salary_min": 130000, "salary_max": 190000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["AWS", "Docker", "Kubernetes", "Linux"]
            },
            {
                "title": "Product Designer - Geforce Experience App",
                "description": "Create layouts collections, customize gaming dashboard controls overlays, and test layouts.",
                "requirements": "Stunning design portfolio showcasing responsive grids and typographical templates.",
                "salary_min": 105000, "salary_max": 150000, "location": "Santa Clara, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Figma", "UI/UX", "User Research"]
            },
            {
                "title": "Junior Developer - CUDA SDK Samples",
                "description": "Draft code samples, write documentation tutorials, and resolve backlog issues.",
                "requirements": "Basic programming background in C++.\nEnthusiastic developer.",
                "salary_min": 85000, "salary_max": 120000, "location": "Santa Clara, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["C++", "Git", "Technical Writing"]
            },
            {
                "title": "QA Automation Engineer - Graphics Driver team",
                "description": "Build automated script pipelines to check driver installations across diverse OS branches.",
                "requirements": "Experience with shell scripts, Python, and system level testing frameworks.",
                "salary_min": 100000, "salary_max": 145000, "location": "Santa Clara, CA", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Python", "Shell Scripting", "QA Testing", "Linux"]
            },
            {
                "title": "Data Scientist - DLSS Performance Group",
                "description": "Develop models to evaluate frame rendering quality, analyze latency files, and build charts.",
                "requirements": "Strong mathematical credentials.\nExperience with Python and PyTorch.",
                "salary_min": 140000, "salary_max": 200000, "location": "Santa Clara, CA", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Python", "PyTorch", "Data Science", "Algorithms"]
            },
            {
                "title": "Systems Engineering Intern - hardware testing",
                "description": "Help configure driver testing hardware benches, compile logs, and write basic scripts.",
                "requirements": "Enrolled in computer engineering degrees.\nBasic knowledge of hardware setups.",
                "salary_min": 55000, "salary_max": 80000, "location": "Santa Clara, CA", "job_type": "onsite",
                "employment_type": "internship", "experience_level": "fresher",
                "skills": ["C++", "Linux", "Git"]
            }
        ]
    },
    "TCS": {
        "website": "https://tcs.com/careers",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
        "description": "Tata Consultancy Services is an IT services, consulting and business solutions organization.",
        "company_type": "mnc",
        "industry": "IT Services & Consulting Solutions",
        "employee_count": 600000,
        "headquarters": "Mumbai, India",
        "founded_year": 1968,
        "jobs": [
            {
                "title": "Systems Engineer - Enterprise Java Platform",
                "description": "Configure Java Spring Web APIs, structure SQL relational databases, and support server integrations.",
                "requirements": "3+ years of Java development experience.\nFamiliarity with Spring Boot frameworks.",
                "salary_min": 60000, "salary_max": 90000, "location": "Mumbai, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Java", "SQL", "Spring Boot", "API Design"]
            },
            {
                "title": "Frontend Developer - Responsive Client App",
                "description": "Design clean web layouts, optimize loading speeds, and implement form validations.",
                "requirements": "Experience with modern JavaScript, CSS, and basic React structures.",
                "salary_min": 50000, "salary_max": 80000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["React", "JavaScript", "HTML5", "CSS3"]
            },
            {
                "title": "Database Administrator - Relational Data Hub",
                "description": "Manage database backups, optimize query execution plans, and resolve memory bottlenecks.",
                "requirements": "Experience administering Postgres or Oracle SQL database engines.",
                "salary_min": 70000, "salary_max": 110000, "location": "Chennai, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["SQL", "Postgres", "Database Design", "Active Directory"]
            },
            {
                "title": "Lead Software Architect - Corporate Portals",
                "description": "Design modular microservice architectures, integrate token protocols, and oversee code reviews.",
                "requirements": "8+ years in software engineering.\nProven experience scaling enterprise solutions.",
                "salary_min": 110000, "salary_max": 160000, "location": "London, UK", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "lead",
                "skills": ["Java", "System Design", "Distributed Systems", "API Design"]
            },
            {
                "title": "DevOps Specialist - Continuous Integration team",
                "description": "Deploy pipeline runners, manage container configurations, and script database upgrades.",
                "requirements": "Experience with Docker, git tools, and scripting languages.",
                "salary_min": 65000, "salary_max": 95000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Docker", "DevOps", "CI/CD", "Linux"]
            },
            {
                "title": "Data Analyst - Operations Analytics",
                "description": "Compile operation metrics, build BI reporting boards, and present charts to clients.",
                "requirements": "Skills in SQL, Excel analytics, and BI visualization dashboards.",
                "salary_min": 45000, "salary_max": 70000, "location": "Kolkata, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["SQL", "Tableau", "Excel", "Pandas"]
            },
            {
                "title": "Security Analyst - Network Threat Auditing",
                "description": "Perform server access checks, trace packets anomalies, and configure firewall layers.",
                "requirements": "Basic understanding of cybersecurity policies and network protocols.",
                "salary_min": 75000, "salary_max": 115000, "location": "New York, NY", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Cybersecurity", "Networking", "Linux"]
            },
            {
                "title": "Cloud Migration Consultant - AWS Platforms",
                "description": "Coordinate migration steps, deploy cloud templates, and optimize virtual hosting profiles.",
                "requirements": "Certifications in AWS cloud configurations.\nExperience with database exports.",
                "salary_min": 85000, "salary_max": 130000, "location": "Bangalore, India", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["AWS", "Cloud Architecture", "SQL"]
            },
            {
                "title": "Technical Writer - System Integrations",
                "description": "Write database API guides, developer code docs, and release manuals.",
                "requirements": "Familiarity with programming paradigms.\nClear writing capabilities.",
                "salary_min": 40000, "salary_max": 65000, "location": "Pune, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["Technical Writing", "Git", "HTML5"]
            },
            {
                "title": "QA Test Engineer - Automation Testing",
                "description": "Write automated web flow test scripts, profile server latency, and run regression tests.",
                "requirements": "Experience with Python, Selenium, and standard QA pipelines.",
                "salary_min": 55000, "salary_max": 85000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["Selenium", "Python", "QA Testing", "Git"]
            },
            {
                "title": "UX Designer - Portal Visual Templates",
                "description": "Draft interactive mockups, design consistent typography grids, and verify mobile layout safety.",
                "requirements": "Clean portfolio detailing user flow optimization and grid designs.",
                "salary_min": 60000, "salary_max": 95000, "location": "Mumbai, India", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Figma", "UI/UX", "Mobile Design"]
            },
            {
                "title": "Systems Developer Intern - Python scripting",
                "description": "Assist in writing basic data processing tools, configuring databases, and compiling tests.",
                "requirements": "Enrolled in technical degree programs.\nBasic knowledge of Python.",
                "salary_min": 25000, "salary_max": 40000, "location": "Remote, India", "job_type": "remote",
                "employment_type": "internship", "experience_level": "fresher",
                "skills": ["Python", "Git", "SQL"]
            }
        ]
    },
    "Infosys": {
        "website": "https://infosys.com/careers",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
        "description": "Infosys is a global leader in next-generation digital services and consulting.",
        "company_type": "mnc",
        "industry": "Digital Services & Consulting Solutions",
        "employee_count": 330000,
        "headquarters": "Bangalore, India",
        "founded_year": 1981,
        "jobs": [
            {
                "title": "Systems Engineer - Enterprise Java Platform",
                "description": "Configure Java Spring Web APIs, structure SQL relational databases, and support server integrations.",
                "requirements": "3+ years of Java development experience.\nFamiliarity with Spring Boot frameworks.",
                "salary_min": 58000, "salary_max": 88000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Java", "SQL", "Spring Boot", "API Design"]
            },
            {
                "title": "Frontend Developer - Responsive Client App",
                "description": "Design clean web layouts, optimize loading speeds, and implement form validations.",
                "requirements": "Experience with modern JavaScript, CSS, and basic React structures.",
                "salary_min": 48000, "salary_max": 78000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["React", "JavaScript", "HTML5", "CSS3"]
            },
            {
                "title": "Database Administrator - Relational Data Hub",
                "description": "Manage database backups, optimize query execution plans, and resolve memory bottlenecks.",
                "requirements": "Experience administering Postgres or Oracle SQL database engines.",
                "salary_min": 68000, "salary_max": 105000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["SQL", "Postgres", "Database Design", "Active Directory"]
            },
            {
                "title": "Lead Software Architect - Corporate Portals",
                "description": "Design modular microservice architectures, integrate token protocols, and oversee code reviews.",
                "requirements": "8+ years in software engineering.\nProven experience scaling enterprise solutions.",
                "salary_min": 105000, "salary_max": 155000, "location": "Frankfurt, Germany", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "lead",
                "skills": ["Java", "System Design", "Distributed Systems", "API Design"]
            },
            {
                "title": "DevOps Specialist - Continuous Integration team",
                "description": "Deploy pipeline runners, manage container configurations, and script database upgrades.",
                "requirements": "Experience with Docker, git tools, and scripting languages.",
                "salary_min": 62000, "salary_max": 92000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Docker", "DevOps", "CI/CD", "Linux"]
            },
            {
                "title": "Data Analyst - Operations Analytics",
                "description": "Compile operation metrics, build BI reporting boards, and present charts to clients.",
                "requirements": "Skills in SQL, Excel analytics, and BI visualization dashboards.",
                "salary_min": 42000, "salary_max": 68000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["SQL", "Tableau", "Excel", "Pandas"]
            },
            {
                "title": "Security Analyst - Network Threat Auditing",
                "description": "Perform server access checks, trace packets anomalies, and configure firewall layers.",
                "requirements": "Basic understanding of cybersecurity policies and network protocols.",
                "salary_min": 72000, "salary_max": 110000, "location": "Richardson, TX", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Cybersecurity", "Networking", "Linux"]
            },
            {
                "title": "Cloud Migration Consultant - AWS Platforms",
                "description": "Coordinate migration steps, deploy cloud templates, and optimize virtual hosting profiles.",
                "requirements": "Certifications in AWS cloud configurations.\nExperience with database exports.",
                "salary_min": 82000, "salary_max": 125000, "location": "Bangalore, India", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["AWS", "Cloud Architecture", "SQL"]
            },
            {
                "title": "Technical Writer - System Integrations",
                "description": "Write database API guides, developer code docs, and release manuals.",
                "requirements": "Familiarity with programming paradigms.\nClear writing capabilities.",
                "salary_min": 38000, "salary_max": 62000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["Technical Writing", "Git", "HTML5"]
            },
            {
                "title": "QA Test Engineer - Automation Testing",
                "description": "Write automated web flow test scripts, profile server latency, and run regression tests.",
                "requirements": "Experience with Python, Selenium, and standard QA pipelines.",
                "salary_min": 52000, "salary_max": 82000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["Selenium", "Python", "QA Testing", "Git"]
            },
            {
                "title": "UX Designer - Portal Visual Templates",
                "description": "Draft interactive mockups, design consistent typography grids, and verify mobile layout safety.",
                "requirements": "Clean portfolio detailing user flow optimization and grid designs.",
                "salary_min": 58000, "salary_max": 92000, "location": "Bangalore, India", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Figma", "UI/UX", "Mobile Design"]
            },
            {
                "title": "Systems Developer Intern - Python scripting",
                "description": "Assist in writing basic data processing tools, configuring databases, and compiling tests.",
                "requirements": "Enrolled in technical degree programs.\nBasic knowledge of Python.",
                "salary_min": 22000, "salary_max": 38000, "location": "Remote, India", "job_type": "remote",
                "employment_type": "internship", "experience_level": "fresher",
                "skills": ["Python", "Git", "SQL"]
            }
        ]
    },
    "Wipro": {
        "website": "https://wipro.com/careers",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Logo.svg",
        "description": "Wipro is a leading global information technology, consulting and business process services company.",
        "company_type": "mnc",
        "industry": "Consulting & Business Process Services",
        "employee_count": 250000,
        "headquarters": "Bangalore, India",
        "founded_year": 1945,
        "jobs": [
            {
                "title": "Systems Engineer - Enterprise Java Platform",
                "description": "Configure Java Spring Web APIs, structure SQL relational databases, and support server integrations.",
                "requirements": "3+ years of Java development experience.\nFamiliarity with Spring Boot frameworks.",
                "salary_min": 56000, "salary_max": 86000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Java", "SQL", "Spring Boot", "API Design"]
            },
            {
                "title": "Frontend Developer - Responsive Client App",
                "description": "Design clean web layouts, optimize loading speeds, and implement form validations.",
                "requirements": "Experience with modern JavaScript, CSS, and basic React structures.",
                "salary_min": 46000, "salary_max": 76000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["React", "JavaScript", "HTML5", "CSS3"]
            },
            {
                "title": "Database Administrator - Relational Data Hub",
                "description": "Manage database backups, optimize query execution plans, and resolve memory bottlenecks.",
                "requirements": "Experience administering Postgres or Oracle SQL database engines.",
                "salary_min": 66000, "salary_max": 102000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["SQL", "Postgres", "Database Design", "Active Directory"]
            },
            {
                "title": "Lead Software Architect - Corporate Portals",
                "description": "Design modular microservice architectures, integrate token protocols, and oversee code reviews.",
                "requirements": "8+ years in software engineering.\nProven experience scaling enterprise solutions.",
                "salary_min": 102000, "salary_max": 152000, "location": "Melbourne, Australia", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "lead",
                "skills": ["Java", "System Design", "Distributed Systems", "API Design"]
            },
            {
                "title": "DevOps Specialist - Continuous Integration team",
                "description": "Deploy pipeline runners, manage container configurations, and script database upgrades.",
                "requirements": "Experience with Docker, git tools, and scripting languages.",
                "salary_min": 60000, "salary_max": 90000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Docker", "DevOps", "CI/CD", "Linux"]
            },
            {
                "title": "Data Analyst - Operations Analytics",
                "description": "Compile operation metrics, build BI reporting boards, and present charts to clients.",
                "requirements": "Skills in SQL, Excel analytics, and BI visualization dashboards.",
                "salary_min": 40000, "salary_max": 66000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["SQL", "Tableau", "Excel", "Pandas"]
            },
            {
                "title": "Security Analyst - Network Threat Auditing",
                "description": "Perform server access checks, trace packets anomalies, and configure firewall layers.",
                "requirements": "Basic understanding of cybersecurity policies and network protocols.",
                "salary_min": 70000, "salary_max": 108000, "location": "Remote, Australia", "job_type": "remote",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Cybersecurity", "Networking", "Linux"]
            },
            {
                "title": "Cloud Migration Consultant - AWS Platforms",
                "description": "Coordinate migration steps, deploy cloud templates, and optimize virtual hosting profiles.",
                "requirements": "Certifications in AWS cloud configurations.\nExperience with database exports.",
                "salary_min": 80000, "salary_max": 122000, "location": "Bangalore, India", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["AWS", "Cloud Architecture", "SQL"]
            },
            {
                "title": "Technical Writer - System Integrations",
                "description": "Write database API guides, developer code docs, and release manuals.",
                "requirements": "Familiarity with programming paradigms.\nClear writing capabilities.",
                "salary_min": 36000, "salary_max": 60000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["Technical Writing", "Git", "HTML5"]
            },
            {
                "title": "QA Test Engineer - Automation Testing",
                "description": "Write automated web flow test scripts, profile server latency, and run regression tests.",
                "requirements": "Experience with Python, Selenium, and standard QA pipelines.",
                "salary_min": 50000, "salary_max": 80000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["Selenium", "Python", "QA Testing", "Git"]
            },
            {
                "title": "UX Designer - Portal Visual Templates",
                "description": "Draft interactive mockups, design consistent typography grids, and verify mobile layout safety.",
                "requirements": "Clean portfolio detailing user flow optimization and grid designs.",
                "salary_min": 56000, "salary_max": 90000, "location": "Bangalore, India", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Figma", "UI/UX", "Mobile Design"]
            },
            {
                "title": "Systems Developer Intern - Python scripting",
                "description": "Assist in writing basic data processing tools, configuring databases, and compiling tests.",
                "requirements": "Enrolled in technical degree programs.\nBasic knowledge of Python.",
                "salary_min": 20000, "salary_max": 36000, "location": "Remote, India", "job_type": "remote",
                "employment_type": "internship", "experience_level": "fresher",
                "skills": ["Python", "Git", "SQL"]
            }
        ]
    },
    "Accenture": {
        "website": "https://accenture.com/careers",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg",
        "description": "Accenture is a global professional services company with leading capabilities in digital, cloud and security.",
        "company_type": "mnc",
        "industry": "Professional Services & IT Consulting",
        "employee_count": 738000,
        "headquarters": "Dublin, Ireland",
        "founded_year": 1989,
        "jobs": [
            {
                "title": "Technical Consulting Manager - Cloud Solutions",
                "description": "Coordinate multi-tenant cloud migrations, draft architecture patterns, and guide customer presentations.",
                "requirements": "Prior client consulting experience.\nStrong systems configuration knowledge in AWS/Azure.",
                "salary_min": 130000, "salary_max": 195000, "location": "Bangalore, India", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["AWS", "Azure", "Cloud Architecture", "Consulting"]
            },
            {
                "title": "Frontend Architect - Client Digital Portal",
                "description": "Design clean web dashboards, unify CSS components layers, and optimize script loading latency.",
                "requirements": "5+ years developing responsive frontends.\nDeep knowledge of React and browser performance.",
                "salary_min": 115000, "salary_max": 170000, "location": "Dublin, Ireland", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "lead",
                "skills": ["React", "TypeScript", "HTML5", "CSS3"]
            },
            {
                "title": "Database Engineer - SQL Platform Integration",
                "description": "Configure relational tables, build storage procedures, and optimize indexing strategies.",
                "requirements": "Experience with transaction systems, Postgres databases, and schema design.",
                "salary_min": 90000, "salary_max": 135000, "location": "Manila, Philippines", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["SQL", "Postgres", "Database Design", "Performance Optimization"]
            },
            {
                "title": "DevOps Engineer - Infrastructure Platforms",
                "description": "Manage container runners, deploy secure pipeline nodes, and automate validation scripts.",
                "requirements": "Experience with Git, Docker, Kubernetes, and Linux servers.",
                "salary_min": 105000, "salary_max": 150000, "location": "Dublin, Ireland", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Docker", "Kubernetes", "DevOps", "Linux"]
            },
            {
                "title": "Data Scientist - Predictive Analytics team",
                "description": "Develop client business analytics algorithms, model user metrics, and trace performance reports.",
                "requirements": "Experience in data sciences, machine learning modeling, and statistical SQL tools.",
                "salary_min": 120000, "salary_max": 180000, "location": "Dublin, Ireland", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Python", "SQL", "Data Science", "Pandas"]
            },
            {
                "title": "Security Specialist - Identity Governance",
                "description": "Audit platform configurations, secure client portals, and integrate active directories.",
                "requirements": "Experience configuring SAML, OAuth, and credential systems.",
                "salary_min": 110000, "salary_max": 165000, "location": "Dublin, Ireland", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Cybersecurity", "Active Directory", "Authentication Protocols"]
            },
            {
                "title": "Lead Software Developer - Custom SaaS integrations",
                "description": "Lead the team building server components and REST web APIs for corporate clients.",
                "requirements": "8+ years in software development.\nPrior experience as a technical leader.",
                "salary_min": 160000, "salary_max": 240000, "location": "Dublin, Ireland", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "lead",
                "skills": ["Java", "API Design", "Distributed Systems", "System Design"]
            },
            {
                "title": "Junior Developer - Python Data Systems",
                "description": "Write script utilities, extract database tables, and run routine report logs.",
                "requirements": "Basic programming background in Python and SQL.\nCollaborative worker.",
                "salary_min": 75000, "salary_max": 105000, "location": "Dublin, Ireland", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["Python", "SQL", "Git"]
            },
            {
                "title": "UX Researcher - Product Usability Lab",
                "description": "Lead user feedback interviews, construct layouts wireframes, and verify usability.",
                "requirements": "Design portfolio detailing product optimization steps and visual hierarchies.",
                "salary_min": 95000, "salary_max": 140000, "location": "Dublin, Ireland", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Figma", "UI/UX", "User Research"]
            },
            {
                "title": "QA Automation Engineer - Integration Testing",
                "description": "Create automated script test plans, run browser checks, and report error logs.",
                "requirements": "Experience writing web automation scripts with Cypress or Python.",
                "salary_min": 90000, "salary_max": 130000, "location": "Dublin, Ireland", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Cypress", "QA Testing", "Selenium", "Git"]
            },
            {
                "title": "Product Designer - Creative visual structures",
                "description": "Develop branding styles guides, customize visual layouts grids, and test responsiveness.",
                "requirements": "Visual design portfolio showcasing typography systems.",
                "salary_min": 98000, "salary_max": 145000, "location": "Dublin, Ireland", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Figma", "UI/UX", "Mobile Design"]
            },
            {
                "title": "Technical Analyst Intern - Cloud deployments",
                "description": "Assist in launching server templates, configuring networks, and writing clean reports.",
                "requirements": "Enrolled in technical degree programs.\nBasic interest in cloud infrastructure.",
                "salary_min": 50000, "salary_max": 75000, "location": "Dublin, Ireland", "job_type": "onsite",
                "employment_type": "internship", "experience_level": "fresher",
                "skills": ["AWS", "Git", "Linux"]
            }
        ]
    },
    "Deloitte": {
        "website": "https://deloitte.com/careers",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/5/56/Deloitte.svg",
        "description": "Deloitte drives progress. Our firms provide audit, consulting, financial advisory, risk management, and tax services.",
        "company_type": "mnc",
        "industry": "Corporate Audit & Strategy Consulting",
        "employee_count": 457000,
        "headquarters": "London, UK",
        "founded_year": 1845,
        "jobs": [
            {
                "title": "Technical Consulting Manager - Cloud Solutions",
                "description": "Coordinate multi-tenant cloud migrations, draft architecture patterns, and guide customer presentations.",
                "requirements": "Prior client consulting experience.\nStrong systems configuration knowledge in AWS/Azure.",
                "salary_min": 128000, "salary_max": 192000, "location": "Mumbai, India", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["AWS", "Azure", "Cloud Architecture", "Consulting"]
            },
            {
                "title": "Frontend Architect - Client Digital Portal",
                "description": "Design clean web dashboards, unify CSS components layers, and optimize script loading latency.",
                "requirements": "5+ years developing responsive frontends.\nDeep knowledge of React and browser performance.",
                "salary_min": 112000, "salary_max": 168000, "location": "London, UK", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "lead",
                "skills": ["React", "TypeScript", "HTML5", "CSS3"]
            },
            {
                "title": "Database Engineer - SQL Platform Integration",
                "description": "Configure relational tables, build storage procedures, and optimize indexing strategies.",
                "requirements": "Experience with transaction systems, Postgres databases, and schema design.",
                "salary_min": 88000, "salary_max": 132000, "location": "Chicago, IL", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["SQL", "Postgres", "Database Design", "Performance Optimization"]
            },
            {
                "title": "DevOps Engineer - Infrastructure Platforms",
                "description": "Manage container runners, deploy secure pipeline nodes, and automate validation scripts.",
                "requirements": "Experience with Git, Docker, Kubernetes, and Linux servers.",
                "salary_min": 102000, "salary_max": 148000, "location": "London, UK", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Docker", "Kubernetes", "DevOps", "Linux"]
            },
            {
                "title": "Data Scientist - Predictive Analytics team",
                "description": "Develop client business analytics algorithms, model user metrics, and trace performance reports.",
                "requirements": "Experience in data sciences, machine learning modeling, and statistical SQL tools.",
                "salary_min": 118000, "salary_max": 178000, "location": "London, UK", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Python", "SQL", "Data Science", "Pandas"]
            },
            {
                "title": "Security Specialist - Identity Governance",
                "description": "Audit platform configurations, secure client portals, and integrate active directories.",
                "requirements": "Experience configuring SAML, OAuth, and credential systems.",
                "salary_min": 108000, "salary_max": 162000, "location": "London, UK", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Cybersecurity", "Active Directory", "Authentication Protocols"]
            },
            {
                "title": "Lead Software Developer - Custom SaaS integrations",
                "description": "Lead the team building server components and REST web APIs for corporate clients.",
                "requirements": "8+ years in software development.\nPrior experience as a technical leader.",
                "salary_min": 158000, "salary_max": 238000, "location": "London, UK", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "lead",
                "skills": ["Java", "API Design", "Distributed Systems", "System Design"]
            },
            {
                "title": "Junior Developer - Python Data Systems",
                "description": "Write script utilities, extract database tables, and run routine report logs.",
                "requirements": "Basic programming background in Python and SQL.\nCollaborative worker.",
                "salary_min": 72000, "salary_max": 102000, "location": "London, UK", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["Python", "SQL", "Git"]
            },
            {
                "title": "UX Researcher - Product Usability Lab",
                "description": "Lead user feedback interviews, construct layouts wireframes, and verify usability.",
                "requirements": "Design portfolio detailing product optimization steps and visual hierarchies.",
                "salary_min": 92000, "salary_max": 138000, "location": "London, UK", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Figma", "UI/UX", "User Research"]
            },
            {
                "title": "QA Automation Engineer - Integration Testing",
                "description": "Create automated script test plans, run browser checks, and report error logs.",
                "requirements": "Experience writing automated script suites with Cypress or Python.",
                "salary_min": 88000, "salary_max": 128000, "location": "London, UK", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Cypress", "QA Testing", "Selenium", "Git"]
            },
            {
                "title": "Product Designer - Creative visual structures",
                "description": "Develop branding styles guides, customize visual layouts grids, and test responsiveness.",
                "requirements": "Visual design portfolio showcasing typography systems.",
                "salary_min": 95000, "salary_max": 142000, "location": "London, UK", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Figma", "UI/UX", "Mobile Design"]
            },
            {
                "title": "Technical Analyst Intern - Cloud deployments",
                "description": "Assist in launching server templates, configuring networks, and writing clean reports.",
                "requirements": "Enrolled in technical degree programs.\nBasic interest in cloud infrastructure.",
                "salary_min": 48000, "salary_max": 72000, "location": "London, UK", "job_type": "onsite",
                "employment_type": "internship", "experience_level": "fresher",
                "skills": ["AWS", "Git", "Linux"]
            }
        ]
    },
    "IBM": {
        "website": "https://ibm.com/jobs",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
        "description": "IBM is a leading global hybrid cloud and AI, and business services provider.",
        "company_type": "mnc",
        "industry": "Enterprise Computing & AI Technology",
        "employee_count": 288000,
        "headquarters": "Armonk, NY",
        "founded_year": 1911,
        "jobs": [
            {
                "title": "Cloud Platform Developer - IBM Cloud VPC",
                "description": "Develop server virtualization code, configure network security layers, and trace cluster load indexes.",
                "requirements": "3+ years in cloud infrastructure development.\nExperience with Go, Python, or C++.",
                "salary_min": 115000, "salary_max": 170000, "location": "Austin, TX", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Go", "Python", "Cloud Architecture", "Linux"]
            },
            {
                "title": "Senior Backend Architect - Watsonx AI APIs",
                "description": "Scale low-latency backend access to large model deployments, define routing rules, and optimize database schemas.",
                "requirements": "5+ years systems design experience.\nDeep knowledge of Python and REST API modeling.",
                "salary_min": 160000, "salary_max": 240000, "location": "Armonk, NY", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["Python", "API Design", "Distributed Systems", "SQL"]
            },
            {
                "title": "Frontend Engineer - Cloud Console UI",
                "description": "Implement modern, glassmorphic dashboards templates for cluster networking maps.",
                "requirements": "Experience writing highly interactive React code and managing application state.",
                "salary_min": 110000, "salary_max": 165000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["React", "TypeScript", "HTML5", "CSS3"]
            },
            {
                "title": "DevOps Engineer - OpenShift Container Engine",
                "description": "Manage secure Docker images build tasks, build custom CI/CD scripts, and audit server setups.",
                "requirements": "Experience administering RedHat OpenShift, Kubernetes, and Docker environments.",
                "salary_min": 120000, "salary_max": 180000, "location": "Austin, TX", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Docker", "Kubernetes", "DevOps", "Linux"]
            },
            {
                "title": "Data Scientist - Quantum Computing Research",
                "description": "Model complex quantum simulation matrices, analyze execution logs, and write clean scripts.",
                "requirements": "Master's or Ph.D. in Physics, Mathematics, or CS.\nExperience with Python mathematical libraries.",
                "salary_min": 140000, "salary_max": 210000, "location": "Armonk, NY", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "lead",
                "skills": ["Python", "Data Science", "Algorithms", "AI Research"]
            },
            {
                "title": "Security Analyst - Threat Detection Center",
                "description": "Monitor secure server access files, identify vulnerability vectors, and configure firewalls.",
                "requirements": "Knowledge of cybersecurity architectures, network tools, and server configurations.",
                "salary_min": 105000, "salary_max": 155000, "location": "Remote, US", "job_type": "remote",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Cybersecurity", "Networking", "Linux"]
            },
            {
                "title": "Product Designer - IBM watsonx Portal",
                "description": "Draft interactive user journeys, design consistent typography rules, and verify visual guidelines.",
                "requirements": "Stunning design portfolio showcasing clean layouts and premium dark themes.",
                "salary_min": 100000, "salary_max": 145000, "location": "Austin, TX", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Figma", "UI/UX", "User Research"]
            },
            {
                "title": "Lead Database Engineer - Db2 Engine Group",
                "description": "Research index scaling algorithms, memory-buffer storage schemes, and low-latency storage architectures.",
                "requirements": "8+ years in database designs.\nDeep familiarity with SQL parsing models.",
                "salary_min": 175000, "salary_max": 270000, "location": "Austin, TX", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "lead",
                "skills": ["C++", "C", "Database Design", "System Design"]
            },
            {
                "title": "Junior Developer - Web API Support",
                "description": "Maintain simple REST routes, address backlogged service issues, and write API guides.",
                "requirements": "Basic programming background in JavaScript or Python.\nCollaborative learner.",
                "salary_min": 80000, "salary_max": 115000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["JavaScript", "Python", "Git"]
            },
            {
                "title": "QA Automation Engineer - OpenShift team",
                "description": "Create automated script test cases, run build tests, and compile reports.",
                "requirements": "Experience writing automated script suites with Python or Selenium.",
                "salary_min": 95000, "salary_max": 140000, "location": "Austin, TX", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Python", "QA Testing", "Selenium", "Git"]
            },
            {
                "title": "Cloud Architect - Public Sector migrations",
                "description": "Design secure server instances and configure access profiles for governmental organizations.",
                "requirements": "Must meet security clearance credentials.\nExperience with AWS/Azure configurations.",
                "salary_min": 135000, "salary_max": 195000, "location": "Armonk, NY", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "senior",
                "skills": ["AWS", "Azure", "Cloud Architecture", "Cybersecurity"]
            },
            {
                "title": "Systems Analyst Intern - Python data utilities",
                "description": "Assist in writing basic file processing scripts, database updates, and compiler checks.",
                "requirements": "Enrolled in technical degree programs.\nBasic knowledge of Python.",
                "salary_min": 50000, "salary_max": 75000, "location": "Austin, TX", "job_type": "onsite",
                "employment_type": "internship", "experience_level": "fresher",
                "skills": ["Python", "Git", "SQL"]
            }
        ]
    },
    "Capgemini": {
        "website": "https://capgemini.com/careers",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/f/fe/Capgemini_2017_logo.svg",
        "description": "Capgemini is a global leader in partnering with companies to transform and manage their business through technology.",
        "company_type": "mnc",
        "industry": "Consulting & Technology Services",
        "employee_count": 360000,
        "headquarters": "Paris, France",
        "founded_year": 1967,
        "jobs": [
            {
                "title": "Systems Engineer - Enterprise Java Platform",
                "description": "Configure Java Spring Web APIs, structure SQL relational databases, and support server integrations.",
                "requirements": "3+ years of Java development experience.\nFamiliarity with Spring Boot frameworks.",
                "salary_min": 55000, "salary_max": 85000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Java", "SQL", "Spring Boot", "API Design"]
            },
            {
                "title": "Frontend Developer - Responsive Client App",
                "description": "Design clean web layouts, optimize loading speeds, and implement form validations.",
                "requirements": "Experience with modern JavaScript, CSS, and basic React structures.",
                "salary_min": 45000, "salary_max": 75000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["React", "JavaScript", "HTML5", "CSS3"]
            },
            {
                "title": "Database Administrator - Relational Data Hub",
                "description": "Manage database backups, optimize query execution plans, and resolve memory bottlenecks.",
                "requirements": "Experience administering Postgres or Oracle SQL database engines.",
                "salary_min": 65000, "salary_max": 100000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["SQL", "Postgres", "Database Design", "Active Directory"]
            },
            {
                "title": "Lead Software Architect - Corporate Portals",
                "description": "Design modular microservice architectures, integrate token protocols, and oversee code reviews.",
                "requirements": "8+ years in software engineering.\nProven experience scaling enterprise solutions.",
                "salary_min": 100000, "salary_max": 150000, "location": "Paris, France", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "lead",
                "skills": ["Java", "System Design", "Distributed Systems", "API Design"]
            },
            {
                "title": "DevOps Specialist - Continuous Integration team",
                "description": "Deploy pipeline runners, manage container configurations, and script database upgrades.",
                "requirements": "Experience with Docker, git tools, and scripting languages.",
                "salary_min": 58000, "salary_max": 88000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Docker", "DevOps", "CI/CD", "Linux"]
            },
            {
                "title": "Data Analyst - Operations Analytics",
                "description": "Compile operation metrics, build BI reporting boards, and present charts to clients.",
                "requirements": "Skills in SQL, Excel analytics, and BI visualization dashboards.",
                "salary_min": 38000, "salary_max": 62000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["SQL", "Tableau", "Excel", "Pandas"]
            },
            {
                "title": "Security Analyst - Network Threat Auditing",
                "description": "Perform server access checks, trace packets anomalies, and configure firewall layers.",
                "requirements": "Basic understanding of cybersecurity policies and network protocols.",
                "salary_min": 68000, "salary_max": 105000, "location": "Chicago, IL", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Cybersecurity", "Networking", "Linux"]
            },
            {
                "title": "Cloud Migration Consultant - AWS Platforms",
                "description": "Coordinate migration steps, deploy cloud templates, and optimize virtual hosting profiles.",
                "requirements": "Certifications in AWS cloud configurations.\nExperience with database exports.",
                "salary_min": 78000, "salary_max": 120000, "location": "Bangalore, India", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["AWS", "Cloud Architecture", "SQL"]
            },
            {
                "title": "Technical Writer - System Integrations",
                "description": "Write database API guides, developer code docs, and release manuals.",
                "requirements": "Familiarity with programming paradigms.\nClear writing capabilities.",
                "salary_min": 35000, "salary_max": 58000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["Technical Writing", "Git", "HTML5"]
            },
            {
                "title": "QA Test Engineer - Automation Testing",
                "description": "Write automated web flow test scripts, profile server latency, and run regression tests.",
                "requirements": "Experience with Python, Selenium, and standard QA pipelines.",
                "salary_min": 48000, "salary_max": 78000, "location": "Bangalore, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["Selenium", "Python", "QA Testing", "Git"]
            },
            {
                "title": "UX Designer - Portal Visual Templates",
                "description": "Draft interactive mockups, design consistent typography grids, and verify mobile layout safety.",
                "requirements": "Clean portfolio detailing user flow optimization and grid designs.",
                "salary_min": 54000, "salary_max": 88000, "location": "Bangalore, India", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Figma", "UI/UX", "Mobile Design"]
            },
            {
                "title": "Systems Developer Intern - Python scripting",
                "description": "Assist in writing basic data processing tools, configuring databases, and compiling tests.",
                "requirements": "Enrolled in technical degree programs.\nBasic knowledge of Python.",
                "salary_min": 18000, "salary_max": 32000, "location": "Remote, India", "job_type": "remote",
                "employment_type": "internship", "experience_level": "fresher",
                "skills": ["Python", "Git", "SQL"]
            }
        ]
    },
    "Cognizant": {
        "website": "https://cognizant.com/careers",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/f/f3/Cognizant_logo_2022.svg",
        "description": "Cognizant engineers modern businesses. We help our clients modernize technology, reimagine processes and transform experiences.",
        "company_type": "mnc",
        "industry": "Business Process & Technology Services",
        "employee_count": 355000,
        "headquarters": "Teaneck, NJ",
        "founded_year": 1994,
        "jobs": [
            {
                "title": "Systems Engineer - Enterprise Java Platform",
                "description": "Configure Java Spring Web APIs, structure SQL relational databases, and support server integrations.",
                "requirements": "3+ years of Java development experience.\nFamiliarity with Spring Boot frameworks.",
                "salary_min": 54000, "salary_max": 84000, "location": "Chennai, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Java", "SQL", "Spring Boot", "API Design"]
            },
            {
                "title": "Frontend Developer - Responsive Client App",
                "description": "Design clean web layouts, optimize loading speeds, and implement form validations.",
                "requirements": "Experience with modern JavaScript, CSS, and basic React structures.",
                "salary_min": 44000, "salary_max": 74000, "location": "Chennai, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["React", "JavaScript", "HTML5", "CSS3"]
            },
            {
                "title": "Database Administrator - Relational Data Hub",
                "description": "Manage database backups, optimize query execution plans, and resolve memory bottlenecks.",
                "requirements": "Experience administering Postgres or Oracle SQL database engines.",
                "salary_min": 64000, "salary_max": 98000, "location": "Chennai, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["SQL", "Postgres", "Database Design", "Active Directory"]
            },
            {
                "title": "Lead Software Architect - Corporate Portals",
                "description": "Design modular microservice architectures, integrate token protocols, and oversee code reviews.",
                "requirements": "8+ years in software engineering.\nProven experience scaling enterprise solutions.",
                "salary_min": 98000, "salary_max": 148000, "location": "London, UK", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "lead",
                "skills": ["Java", "System Design", "Distributed Systems", "API Design"]
            },
            {
                "title": "DevOps Specialist - Continuous Integration team",
                "description": "Deploy pipeline runners, manage container configurations, and script database upgrades.",
                "requirements": "Experience with Docker, git tools, and scripting languages.",
                "salary_min": 56000, "salary_max": 86000, "location": "Chennai, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Docker", "DevOps", "CI/CD", "Linux"]
            },
            {
                "title": "Data Analyst - Operations Analytics",
                "description": "Compile operation metrics, build BI reporting boards, and present charts to clients.",
                "requirements": "Skills in SQL, Excel analytics, and BI visualization dashboards.",
                "salary_min": 36000, "salary_max": 60000, "location": "Chennai, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["SQL", "Tableau", "Excel", "Pandas"]
            },
            {
                "title": "Security Analyst - Network Threat Auditing",
                "description": "Perform server access checks, trace packets anomalies, and configure firewall layers.",
                "requirements": "Basic understanding of cybersecurity policies and network protocols.",
                "salary_min": 66000, "salary_max": 102000, "location": "Teaneck, NJ", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Cybersecurity", "Networking", "Linux"]
            },
            {
                "title": "Cloud Migration Consultant - AWS Platforms",
                "description": "Coordinate migration steps, deploy cloud templates, and optimize virtual hosting profiles.",
                "requirements": "Certifications in AWS cloud configurations.\nExperience with database exports.",
                "salary_min": 76000, "salary_max": 118000, "location": "Chennai, India", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["AWS", "Cloud Architecture", "SQL"]
            },
            {
                "title": "Technical Writer - System Integrations",
                "description": "Write database API guides, developer code docs, and release manuals.",
                "requirements": "Familiarity with programming paradigms.\nClear writing capabilities.",
                "salary_min": 34000, "salary_max": 56000, "location": "Chennai, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["Technical Writing", "Git", "HTML5"]
            },
            {
                "title": "QA Test Engineer - Automation Testing",
                "description": "Write automated web flow test scripts, profile server latency, and run regression tests.",
                "requirements": "Experience with Python, Selenium, and standard QA pipelines.",
                "salary_min": 46000, "salary_max": 76000, "location": "Chennai, India", "job_type": "onsite",
                "employment_type": "full_time", "experience_level": "junior",
                "skills": ["Selenium", "Python", "QA Testing", "Git"]
            },
            {
                "title": "UX Designer - Portal Visual Templates",
                "description": "Draft interactive mockups, design consistent typography grids, and verify mobile layout safety.",
                "requirements": "Clean portfolio detailing user flow optimization and grid designs.",
                "salary_min": 52000, "salary_max": 86000, "location": "Chennai, India", "job_type": "hybrid",
                "employment_type": "full_time", "experience_level": "mid",
                "skills": ["Figma", "UI/UX", "Mobile Design"]
            },
            {
                "title": "Systems Developer Intern - Python scripting",
                "description": "Assist in writing basic data processing tools, configuring databases, and compiling tests.",
                "requirements": "Enrolled in technical degree programs.\nBasic knowledge of Python.",
                "salary_min": 16000, "salary_max": 30000, "location": "Remote, India", "job_type": "remote",
                "employment_type": "internship", "experience_level": "fresher",
                "skills": ["Python", "Git", "SQL"]
            }
        ]
    }
}
