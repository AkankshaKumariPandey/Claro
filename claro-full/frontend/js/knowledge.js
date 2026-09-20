const Knowledge = {
  data: [],
  async load() {
    // Try cache first
    try {
      const cached = await DB.getCachedKnowledge('questions-v1');
      if (cached && Array.isArray(cached)) {
        this.data = cached;
        return this.data;
      }
    } catch {
      // Ignore cache errors, load from file
    }

    // Load from data/questions.json if available; else seed demo
    try {
      const res = await fetch('data/questions.json');
      if (res.ok) {
        this.data = await res.json();
        // Cache it
        try {
          await DB.cacheKnowledge('questions-v1', this.data);
        } catch {}
      } else {
        this.seedDemo();
      }
    } catch {
      this.seedDemo();
    }
    return this.data;
  },

  seedDemo() {
    this.data = [
      {
        id: "dbms-norm-001",
        subjectId: "dbms",
        level: "Diploma",
        bookId: "dbms-book-001",
        chapterId: "dbms-norm",
        topic: "Introduction",
        question: "What is normalization?",
        answer: {
          summary: "Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity by dividing large tables into smaller, related ones.",
          keyPoints: ["Reduces duplicate data", "Improves data integrity", "Uses normal forms (1NF, 2NF, 3NF, BCNF)"],
          steps: ["Identify repeating groups", "Create separate tables", "Define primary/foreign keys"],
          example: "Instead of storing customer details in every order row, keep a Customers table and reference it by ID.",
          whyItMatters: "It makes databases easier to maintain, reduces anomalies during updates, and supports scalable application design."
        },
        sourceType: "Definition"
      },
      {
        id: "phy-newton-001",
        subjectId: "phy",
        level: "High School",
        bookId: "phy-mech-001",
        chapterId: "phy-lom",
        topic: "Newton's Second Law",
        question: "Explain Newton's second law.",
        answer: {
          summary: "Newton's second law states that the acceleration of an object depends on the net force acting upon it and its mass.",
          keyPoints: ["F = m × a", "Acceleration is directly proportional to force", "Acceleration is inversely proportional to mass"],
          steps: ["Identify mass and acceleration", "Apply F = m × a", "Solve for the unknown"],
          example: "If m = 2 kg and a = 3 m/s², then F = 6 N.",
          whyItMatters: "It connects force, mass, and motion, forming the basis for dynamics in physics and engineering."
        },
        sourceType: "Concept"
      },
      {
        id: "cs-os-001",
        subjectId: "os",
        level: "Diploma",
        bookId: "os-book-001",
        chapterId: "os-intro",
        topic: "OS Basics",
        question: "What is an operating system?",
        answer: {
          summary: "An operating system (OS) is system software that manages hardware and software resources and provides common services for computer programs.",
          keyPoints: ["Manages CPU, memory, storage", "Provides user interface", "Handles files and devices"],
          steps: ["Boot process loads OS", "OS initializes hardware", "Applications run on top of OS"],
          example: "Windows, Linux, and macOS are common operating systems.",
          whyItMatters: "Without an OS, applications couldn't reliably use hardware or coordinate tasks."
        },
        sourceType: "Definition"
      },
      {
        id: "phy-ohm-001",
        subjectId: "phy",
        level: "High School",
        bookId: "phy-elec-001",
        chapterId: "phy-ohm",
        topic: "Ohm's Law",
        question: "Define Ohm's law.",
        answer: {
          summary: "Ohm's law states that the current through a conductor between two points is directly proportional to the voltage across the two points, provided temperature remains constant.",
          keyPoints: ["V = I × R", "Relates voltage, current, resistance", "Valid for ohmic conductors"],
          steps: ["Identify two known quantities among V, I, R", "Rearrange V = I × R", "Calculate the third"],
          example: "If V = 12 V and R = 4 Ω, then I = 3 A.",
          whyItMatters: "It is fundamental for analyzing circuits and designing electronic systems."
        },
        sourceType: "Formula"
      }
    ];
  },

  getAll() { return this.data; },

  getSuggestions(limit = 6) {
    const q = this.data.map(d => d.question);
    return q.slice(0, limit);
  }
};