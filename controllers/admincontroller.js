const Student = require("../models/student");

// ---------------- DASHBOARD ----------------
exports.getDashboard = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();

    // Count students who have not paid this month
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}`;
    const notPaidCount = await Student.countDocuments({
      monthlyPayments: { $not: { $elemMatch: { date: { $gte: new Date(monthStr + "-01") } } } }
    });

    // Revenue for this month
    const studentsWithPayments = await Student.find({
      "monthlyPayments.date": { $gte: new Date(monthStr + "-01") }
    });
    let revenueThisMonth = 0;
    studentsWithPayments.forEach(s => {
      s.monthlyPayments.forEach(p => {
        const payMonth = `${p.date.getFullYear()}-${String(p.date.getMonth() + 1).padStart(2,'0')}`;
        if (payMonth === monthStr) revenueThisMonth += p.amount;
      });
    });

    // Chart: last 6 months
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const studentsThisMonth = await Student.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      const monthName = monthStart.toLocaleString("default", { month: "short" });
      chartData.push({ month: monthName, students: studentsThisMonth });
    }

    res.json({ totalStudents, notPaidCount, revenueThisMonth, monthlyStats: chartData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ---------------- STUDENTS ----------------
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({ students });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- PAYMENTS ----------------
exports.getPayments = async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    const students = await Student.find().sort({ createdAt: -1 });

    const studentsWithStatus = students.map((s) => {
      const paid = s.monthlyPayments.some(
        (p) => p.date.toISOString().slice(0, 7) === month
      );
      return { ...s.toObject(), status: paid ? "paid" : "unpaid" };
    });

    res.json({ students: studentsWithStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.togglePayment = async (req, res) => {
  try {
    const { studentId, month } = req.body; // month: YYYY-MM
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Check if this month is already paid
    const existing = student.monthlyPayments.find(
      (p) => p.date.toISOString().slice(0, 7) === month
    );

    if (existing) {
      // Remove payment
      student.monthlyPayments = student.monthlyPayments.filter(
        (p) => p.date.toISOString().slice(0, 7) !== month
      );
    } else {
      // Add payment
      student.monthlyPayments.push({ date: new Date(month + "-01") });
    }

    await student.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

