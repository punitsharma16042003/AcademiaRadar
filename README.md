# ⚛️ AcademiaRadar

> **A Local Server Web App & Autonomous Crawler for Research, Recruitment, Fellowships & PhD Advertisements across 253 Premier Research Institutes.**

<p align="center">
  <img src="public/logo.png" alt="AcademiaRadar Logo" width="120" style="border-radius: 20px;">
</p>

[![Local Server](https://img.shields.io/badge/Local%20Server-http%3A%2F%2Flocalhost%3A5000-06b6d4)](http://localhost:5000)
[![Institutes Tracked](https://img.shields.io/badge/Institutes%20Tracked-253%20Premier%20Institutes-blue)](http://localhost:5000)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20External%20NPM-10b981)](#zero-external-dependencies)
[![Database](https://img.shields.io/badge/Database-SQLite%20(node%3Asqlite)-purple)](#architecture)

---

## 📌 Overview

**AcademiaRadar** is a local web application designed specifically for scholars, researchers, engineers, doctors, and students. It monitors and indexes active recruitments and admissions from **all 253 top Indian research institutions**:

- **23 IITs** (IIT Bombay, Delhi, Madras, Kharagpur, Kanpur, Roorkee, etc.)
- **IISc Bengaluru, 7 IISERs & NISER** (Premier fundamental science institutes)
- **31 NITs** (NIT Trichy, Surathkal, Warangal, Rourkela, Calicut, etc.)
- **28 IIITs** (IIIT Hyderabad, Delhi, Bangalore, Allahabad, etc.)
- **38 CSIR National Laboratories** (CCMB, CDRI, NCL, IGIB, NPL, NAL, etc.)
- **67 Government R&D Establishments**:
  - **DAE** (BARC, TIFR, IGCAR, SINP, VECC, IPR, IOP, IMSc)
  - **ISRO** (URSC, VSSC, SAC, SDSC-SHAR, PRL, NRSC)
  - **DRDO** (RAC, DRDL, DMRL, ARDE, GTRE, INMAS, SSPL)
  - **ICMR** (NIV, NIN, NIRT, NIE, NIMR, NIRBI, NIOH)
  - **DBT / BRIC** (NII, NCCS, CDFD, NBRC, THSTI, RCB, ILS, RGCB, inStem)
  - **DST Autonomous** (JNCASR, IACS, RRI, Bose Institute, SNBose, IIA)
  - **Earth Sciences, ICAR & Others** (IITM Pune, NCPOR, IARI, C-DAC, SAMEER)
  - **Testing & Standards** (NTH, CPRI, STQC, NIB, CDL, ICAT, ARAI)
- **23 AIIMS Medical Research Institutes** (AIIMS Delhi, Bhopal, Bhubaneswar, Jodhpur, etc.)
- **25 Top Private Universities in Research** (BITS Pilani, MAHE, VIT, Amrita, SRM, etc.)

---

## 🚀 Key Features

### 1. ⚡ Automated Background Crawler & Heuristic Date Parser
- When you start the app, it automatically begins checking institute portals in the background.
- **Smart Date Extractor**: Accurately extracts **Application Start Date**, **Last Date / Deadline**, and **Walk-in Date** from textual announcements, tables, and notices (handling formats like `15.11.2026`, `30 November 2026`, `10-12-2026`, or `Rolling Advertisements`).
- **Urgency Engine**:
  - 🔴 **Critical**: $\le 3$ days remaining (pulsing alert banner + badge)
  - 🟡 **Warning**: 4 to 7 days remaining
  - 🟢 **Active**: $> 7$ days remaining
  - 🟣 **Rolling**: Open continuous call throughout the year

### 2. 🎯 Categorized Opportunity Explorer
Filter and search opportunities across:
- **PhD Admissions** (Regular, Sponsored, Direct Ph.D., Autumn / Spring sessions)
- **JRF / SRF / Project Fellowships** (MeitY, DST, DBT, CSIR funded projects)
- **Postdoctoral Fellowships** (Institute Postdoc / IPDF, Research Associate)
- **Faculty Recruitments** (Assistant Professor Grade I & II, Associate Professor, Rolling Ads)
- **Scientist & Technical Staff** (Scientist B/C, Technical Officers, DRDO RAC)
- **Research Internships** (Summer & Winter research fellowships for students)

### 3. 📋 Interactive Application Pipeline (Personal Kanban Tracker)
Move applications through a personalized workflow:
`Interested` ➔ `Preparing Documents / SOP` ➔ `Applied (Submitted)` ➔ `Interview / Written Test` ➔ `Selected / Offer`
- Store your **Application Number**, login credentials reminder, PI contacts, and custom notes.

### 4. 📅 1-Click Calendar Export (.ICS)
- Download an RFC 5545 `.ics` file for any advertisement to add the deadline to **Google Calendar**, **Apple Calendar**, or **Outlook** with automated 2-day reminder alarms.

### 5. 🏛️ Directory of 253 Premier Institutions
- Comprehensive database with full address, PIN code, research focus, and **direct links** to:
  - 🌐 Official Home Website
  - 💼 Careers / Recruitment Portal
  - 🎓 PhD Admissions Portal
  - 🔬 Dean of Research (SRIC / IRD) Portal
  - ⚡ "Live Check Portal" button to scan any single institute on demand.

### 6. ➕ Custom Advertisement Adder
- Manually record opportunities seen in newspapers, Employment News, Telegram, or email.

### 7. 📊 Data Export (CSV & JSON)
- Export all active advertisements to an Excel-ready `.csv` spreadsheet or `.json` file.

### 8. 🌓 Polished Dark & Light Theme
- Sleek glassmorphism dashboard optimized for high readability.

---

## 💻 Quick Start Guide

### Option 1: Double-Click (Windows)
Double-click `start_server.bat` in this folder. It will start the server and automatically launch your browser to `http://localhost:5000`.

### Option 2: Command Line (Any OS)
Make sure you have [Node.js](https://nodejs.org) (v18+ or v24+ recommended) installed:

```bash
# Start the local server
node server.js
```

Or using npm:
```bash
npm start
```

Open your browser at:
👉 **`http://localhost:5000`**

---

## 🛠️ Zero External Dependencies

This project is built using **pure native Node.js 24 capabilities**:
- **`node:http`**: Built-in HTTP server and REST API engine.
- **`node:sqlite`**: Built-in SQLite database engine (`research_portal.db`) with zero external C++ compile requirements or npm download needs.
- **Native `fetch`**: Asynchronous web crawler with AbortController timeouts.
- **No `node_modules` weight**: Starts in under 100 milliseconds and works completely offline or on restricted university intranet firewalls.

---

## 📂 Project Structure

```
c:\Users\admin\Desktop\NucleaR\
├── server.js                   # Node.js native HTTP/REST server & router
├── scraper.js                  # Heuristic crawler & date/category parser
├── db.js                       # SQLite database layer (using node:sqlite)
├── start_server.bat            # 1-click Windows launcher & browser opener
├── package.json                # Project manifest & npm scripts
├── data/
│   ├── institutes.json         # Complete 253 institutes directory
│   └── seed_opportunities.json # Pre-seeded verified active opportunities
├── public/
│   ├── index.html              # Modern, responsive SPA dashboard
│   ├── css/style.css           # Polished UI, Dark/Light modes, Kanban styles
│   └── js/app.js               # Reactive frontend logic, filters & calendar
└── scripts/
    ├── build_institutes_data.js # Institutes builder script
    └── verify_logic.js         # End-to-end verification test suite
```

---

## 📜 License
Open-source under ISC License. Developed for Indian researchers and academic applicants.
