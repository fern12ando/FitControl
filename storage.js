/**
 * FITCONTROL — CAMADA DE ARMAZENAMENTO LOCAL (STORAGE & BANCO DE DADOS CLIENT-SIDE)
 * Utiliza localStorage para persistência de dados real sem necessidade de servidor Node.js.
 * Dados de demonstração inicial para apresentação comercial ao cliente.
 */

const STORAGE_KEY = "FITCONTROL_LOCAL_DB_V1";

// Funções utilitárias de formatação brasileira
function formatCurrency(val) {
  const num = Number(val) || 0;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatCPF(val) {
  if (!val) return "";
  const clean = String(val).replace(/\D/g, "");
  if (clean.length !== 11) return val;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatPhone(val) {
  if (!val) return "";
  const clean = String(val).replace(/\D/g, "");
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return val;
}

function isValidCPF(cpf) {
  if (!cpf) return false;
  const clean = String(cpf).replace(/\D/g, "");
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i)) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i)) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10))) return false;

  return true;
}

function formatDateBR(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatDateTimeBR(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${mins}`;
}

// Cálculo exato de vencimento por calendário civil (nunca 30 dias fixos)
function calculateExpirationDate(startDateStr, months) {
  const d = startDateStr ? new Date(startDateStr) : new Date();
  const target = new Date(d.getFullYear(), d.getMonth() + months, d.getDate());
  return target.toISOString().slice(0, 10);
}

function daysUntilExpiration(endDateStr) {
  if (!endDateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDateStr);
  end.setHours(0, 0, 0, 0);
  const diffTime = end.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Base de Dados Inicial para Demonstração Comercial
function getDefaultSeedData() {
  const now = new Date();
  const todayISO = now.toISOString().slice(0, 10);

  return {
    settings: {
      gymName: "FitControl Academia",
      tradeName: "FitControl Fitness Center",
      cnpj: "12.345.678/0001-90",
      email: "contato@fitcontrol.com.br",
      phone: "(82) 3322-1100",
      address: "Av. Fernandes Lima, 1500 - Farol",
      city: "Maceió",
      state: "AL",
      zipCode: "57055-000",
      gracePeriodDays: 2,
      allowOfflineAccess: false,
      requirePhotoOnSignup: true,
      notifyExpiringDays: 7,
    },
    users: [
      {
        id: "usr-1",
        name: "Luis Fernando",
        email: "proprietario@fitcontrol.com",
        role: "PROPRIETARIO",
        phone: "(82) 99999-1001",
        active: true,
      },
      {
        id: "usr-2",
        name: "Carla Mendes",
        email: "admin@fitcontrol.com",
        role: "ADMINISTRADOR",
        phone: "(82) 99888-2002",
        active: true,
      },
      {
        id: "usr-3",
        name: "Ana Paula Silva",
        email: "recepcao@fitcontrol.com",
        role: "RECEPCIONISTA",
        phone: "(82) 99777-3003",
        active: true,
      },
      {
        id: "usr-4",
        name: "Dr. Marcos Consultor",
        email: "consulta@fitcontrol.com",
        role: "CONSULTA",
        phone: "(82) 99666-4004",
        active: true,
      },
    ],
    plans: [
      {
        id: "pln-1",
        name: "Plano Mensal",
        description: "Acesso total à musculação e aeróbico sem fidelidade",
        durationMonths: 1,
        monthlyPrice: 130.0,
        discountPercent: 0,
        totalPrice: 130.0,
        promotionalTag: "Sem fidelidade",
        active: true,
      },
      {
        id: "pln-2",
        name: "Plano Trimestral",
        description: "Contrato de 3 meses com 5% de desconto promocional",
        durationMonths: 3,
        monthlyPrice: 120.0,
        discountPercent: 5,
        totalPrice: 342.0,
        promotionalTag: "Mais Popular",
        active: true,
      },
      {
        id: "pln-3",
        name: "Plano Semestral",
        description: "Contrato de 6 meses com 10% de desconto acumulado",
        durationMonths: 6,
        monthlyPrice: 110.0,
        discountPercent: 10,
        totalPrice: 594.0,
        promotionalTag: "Recomendado",
        active: true,
      },
      {
        id: "pln-4",
        name: "Plano Anual VIP",
        description: "Contrato de 12 meses com 15% de desconto e acesso total",
        durationMonths: 12,
        monthlyPrice: 95.0,
        discountPercent: 15,
        totalPrice: 969.0,
        promotionalTag: "Melhor Custo-Benefício",
        active: true,
      },
    ],
    students: [
      {
        id: "alu-1",
        fullName: "Luis Fernando Santos Ferreira",
        cpf: "123.456.789-00",
        phone: "(82) 98888-1122",
        email: "luis.fernando@email.com",
        birthDate: "1994-08-15",
        address: "Rua do Sol, 250 - Centro, Maceió - AL",
        emergencyContactName: "Maria Ferreira (Mãe)",
        emergencyPhone: "(82) 98888-3344",
        registrationDate: "2026-01-10",
        status: "ATIVO",
        planId: "pln-4",
        planName: "Plano Anual VIP",
        membershipStart: "2026-01-10",
        membershipEnd: "2027-01-10",
        pricePaid: 969.0,
        notes: "Aluno dedicado. Sem restrições médicas.",
        biometricConsent: true,
      },
      {
        id: "alu-2",
        fullName: "Mariana Oliveira Costa",
        cpf: "234.567.890-11",
        phone: "(82) 99123-4567",
        email: "mariana.costa@email.com",
        birthDate: "1998-03-22",
        address: "Av. Dr. Antônio Gouveia, 800 - Pajuçara, Maceió - AL",
        emergencyContactName: "Carlos Costa (Pai)",
        emergencyPhone: "(82) 99123-9999",
        registrationDate: "2026-09-01",
        status: "ATIVO",
        planId: "pln-2",
        planName: "Plano Trimestral",
        membershipStart: "2026-09-01",
        membershipEnd: calculateExpirationDate("2026-09-01", 3),
        pricePaid: 342.0,
        notes: "Treino funcional e musculação.",
        biometricConsent: true,
      },
      {
        id: "alu-3",
        fullName: "Rodrigo Lima Silva",
        cpf: "345.678.901-22",
        phone: "(82) 98765-4321",
        email: "rodrigo.lima@email.com",
        birthDate: "1990-11-05",
        address: "Rua Eng. Mário de Gusmão, 450 - Ponta Verde, Maceió - AL",
        emergencyContactName: "Juliana Silva (Esposa)",
        emergencyPhone: "(82) 98765-8888",
        registrationDate: "2026-05-15",
        status: "ATIVO",
        planId: "pln-3",
        planName: "Plano Semestral",
        membershipStart: "2026-05-15",
        membershipEnd: calculateExpirationDate("2026-05-15", 6),
        pricePaid: 594.0,
        notes: "Acompanhamento de hipertrofia.",
        biometricConsent: true,
      },
      {
        id: "alu-4",
        fullName: "Camila Rocha Duarte",
        cpf: "456.789.012-33",
        phone: "(82) 99345-6789",
        email: "camila.duarte@email.com",
        birthDate: "2000-07-19",
        address: "Av. Menino Marcelo, 1200 - Serraria, Maceió - AL",
        emergencyContactName: "Beatriz Duarte (Irmã)",
        emergencyPhone: "(82) 99345-1111",
        registrationDate: "2026-10-01",
        status: "SUSPENSO",
        planId: "pln-1",
        planName: "Plano Mensal",
        membershipStart: "2026-10-01",
        membershipEnd: "2026-11-01",
        pricePaid: 130.0,
        notes: "Solicitou suspensão temporária por viagem de estudos.",
        biometricConsent: true,
      },
    ],
    payments: [
      {
        id: "pay-1",
        studentId: "alu-1",
        studentName: "Luis Fernando Santos Ferreira",
        planName: "Plano Anual VIP",
        amount: 969.0,
        netAmount: 969.0,
        discount: 0,
        paymentMethod: "PIX",
        status: "PAGO",
        dueDate: "2026-01-10",
        paidAt: "2026-01-10",
        notes: "Pagamento integral via chave PIX CNPJ",
        operatorName: "Carla Mendes",
      },
      {
        id: "pay-2",
        studentId: "alu-2",
        studentName: "Mariana Oliveira Costa",
        planName: "Plano Trimestral",
        amount: 342.0,
        netAmount: 342.0,
        discount: 0,
        paymentMethod: "CARTAO_CREDITO",
        status: "PAGO",
        dueDate: "2026-09-01",
        paidAt: "2026-09-01",
        notes: "Cartão de Crédito 3x sem juros",
        operatorName: "Ana Paula Silva",
      },
      {
        id: "pay-3",
        studentId: "alu-3",
        studentName: "Rodrigo Lima Silva",
        planName: "Plano Semestral",
        amount: 594.0,
        netAmount: 594.0,
        discount: 0,
        paymentMethod: "DINHEIRO",
        status: "PAGO",
        dueDate: "2026-05-15",
        paidAt: "2026-05-15",
        notes: "Recebido em espécie no balcão",
        operatorName: "Ana Paula Silva",
      },
      {
        id: "pay-4",
        studentId: "alu-4",
        studentName: "Camila Rocha Duarte",
        planName: "Plano Mensal",
        amount: 130.0,
        netAmount: 130.0,
        discount: 0,
        paymentMethod: "PIX",
        status: "PENDENTE",
        dueDate: todayISO,
        paidAt: null,
        notes: "Aguardando renovação do ciclo mensal",
        operatorName: "Carla Mendes",
      },
    ],
    expenses: [
      {
        id: "exp-1",
        title: "Aluguel do Imóvel Farol",
        category: "ALUGUEL",
        amount: 3500.0,
        recipient: "Imobiliária Maceió Prime",
        paymentMethod: "TRANSFERENCIA",
        dueDate: "2026-11-05",
        paidAt: "2026-11-05",
        status: "PAGA",
        notes: "Mês de referência novembro/2026",
      },
      {
        id: "exp-2",
        title: "Energia Elétrica (Equatorial AL)",
        category: "ENERGIA",
        amount: 680.0,
        recipient: "Equatorial Alagoas Distribuidora",
        paymentMethod: "BOLETO",
        dueDate: "2026-11-12",
        paidAt: "2026-11-10",
        status: "PAGA",
        notes: "Consumo dos aparelhos de ar e iluminação",
      },
      {
        id: "exp-3",
        title: "Água e Saneamento (BRK)",
        category: "AGUA",
        amount: 210.0,
        recipient: "BRK Ambiental Alagoas",
        paymentMethod: "PIX",
        dueDate: "2026-11-18",
        paidAt: null,
        status: "PENDENTE",
        notes: "Vestiários e bebedouros",
      },
      {
        id: "exp-4",
        title: "Link Internet Fibra Dedicada",
        category: "INTERNET",
        amount: 180.0,
        recipient: "Provedor Alagoas Fibra",
        paymentMethod: "DEBITO_AUTOMATICO",
        dueDate: "2026-11-20",
        paidAt: null,
        status: "PENDENTE",
        notes: "Conexão da recepção e catracas",
      },
      {
        id: "exp-5",
        title: "Manutenção Preventiva de Esteiras",
        category: "MANUTENCAO",
        amount: 250.0,
        recipient: "TecnoFitness Alagoas",
        paymentMethod: "PIX",
        dueDate: "2026-11-08",
        paidAt: "2026-11-08",
        status: "PAGA",
        notes: "Lubrificação e alinhamento de lonas",
      },
    ],
    cash: {
      status: "ABERTO",
      openedAt: `${todayISO} 06:00:00`,
      closedAt: null,
      initialAmount: 150.0,
      openedBy: "Ana Paula Silva",
      closedBy: null,
      movements: [
        {
          id: "mov-1",
          type: "SUPRIMENTO",
          amount: 150.0,
          description: "Fundo de troco inicial do dia",
          timestamp: `${todayISO} 06:00:00`,
          operator: "Ana Paula Silva",
        },
        {
          id: "mov-2",
          type: "ENTRADA",
          amount: 594.0,
          description: "Mensalidade Plano Semestral (Rodrigo Lima Silva)",
          timestamp: `${todayISO} 08:30:00`,
          operator: "Ana Paula Silva",
        },
      ],
    },
    devices: [
      {
        id: "dev-1",
        name: "Catraca Principal (Entrada)",
        type: "CATRACA",
        model: "Control iD / Topdata Fit",
        ipAddress: "192.168.1.101",
        port: "8080",
        location: "Hall de Entrada",
        status: "ONLINE",
        lastPing: new Date().toISOString(),
      },
      {
        id: "dev-2",
        name: "Terminal Facial 01",
        type: "FACIAL",
        model: "Hikvision MinMoe Facial",
        ipAddress: "192.168.1.102",
        port: "8000",
        location: "Catraca 01 (Pedestal)",
        status: "ONLINE",
        lastPing: new Date().toISOString(),
      },
      {
        id: "dev-3",
        name: "Leitor Biométrico VIP",
        type: "BIOMETRICO",
        model: "Anviz T5 Pro",
        ipAddress: "192.168.1.103",
        port: "5005",
        location: "Acesso Espaço VIP",
        status: "ONLINE",
        lastPing: new Date().toISOString(),
      },
    ],
    accessEvents: [
      {
        id: "acc-1",
        studentName: "Luis Fernando Santos Ferreira",
        identifier: "123.456.789-00",
        deviceName: "Terminal Facial 01",
        eventType: "ENTRADA",
        result: "AUTORIZADO",
        reason: "Plano Anual VIP ativo e regular",
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      },
      {
        id: "acc-2",
        studentName: "Mariana Oliveira Costa",
        identifier: "234.567.890-11",
        deviceName: "Catraca Principal (Entrada)",
        eventType: "ENTRADA",
        result: "AUTORIZADO",
        reason: "Plano Trimestral ativo",
        timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      },
      {
        id: "acc-3",
        studentName: "Camila Rocha Duarte",
        identifier: "456.789.012-33",
        deviceName: "Catraca Principal (Entrada)",
        eventType: "ENTRADA",
        result: "NEGADO",
        reason: "Matrícula suspensa a pedido da aluna",
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
    ],
  };
}

// Inicializador da Camada de Armazenamento
class FitStorage {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      this.reset();
    }
  }

  getData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.reset();
      return JSON.parse(raw);
    } catch (e) {
      console.error("Falha ao recuperar dados do FitControl:", e);
      return this.reset();
    }
  }

  saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Falha ao salvar dados no localStorage:", e);
    }
  }

  reset() {
    const data = getDefaultSeedData();
    this.saveData(data);
    return data;
  }

  // Alunos
  getStudents() {
    return this.getData().students || [];
  }

  getStudentById(id) {
    return this.getStudents().find((s) => s.id === id);
  }

  saveStudent(student) {
    const data = this.getData();
    if (student.id) {
      const idx = data.students.findIndex((s) => s.id === student.id);
      if (idx !== -1) {
        data.students[idx] = { ...data.students[idx], ...student };
      }
    } else {
      student.id = "alu-" + Date.now();
      student.registrationDate = new Date().toISOString().slice(0, 10);
      data.students.unshift(student);
    }
    this.saveData(data);
    return student;
  }

  deleteStudent(id) {
    const data = this.getData();
    data.students = data.students.filter((s) => s.id !== id);
    this.saveData(data);
  }

  // Planos
  getPlans() {
    return this.getData().plans || [];
  }

  savePlan(plan) {
    const data = this.getData();
    if (plan.id) {
      const idx = data.plans.findIndex((p) => p.id === plan.id);
      if (idx !== -1) data.plans[idx] = { ...data.plans[idx], ...plan };
    } else {
      plan.id = "pln-" + Date.now();
      data.plans.push(plan);
    }
    this.saveData(data);
    return plan;
  }

  // Pagamentos
  getPayments() {
    return this.getData().payments || [];
  }

  savePayment(payment) {
    const data = this.getData();
    if (payment.id) {
      const idx = data.payments.findIndex((p) => p.id === payment.id);
      if (idx !== -1) data.payments[idx] = { ...data.payments[idx], ...payment };
    } else {
      payment.id = "pay-" + Date.now();
      data.payments.unshift(payment);
    }
    this.saveData(data);
    return payment;
  }

  confirmPayment(id) {
    const data = this.getData();
    const p = data.payments.find((x) => x.id === id);
    if (p) {
      p.status = "PAGO";
      p.paidAt = new Date().toISOString().slice(0, 10);
      this.saveData(data);
    }
    return p;
  }

  // Despesas
  getExpenses() {
    return this.getData().expenses || [];
  }

  saveExpense(expense) {
    const data = this.getData();
    if (expense.id) {
      const idx = data.expenses.findIndex((e) => e.id === expense.id);
      if (idx !== -1) data.expenses[idx] = { ...data.expenses[idx], ...expense };
    } else {
      expense.id = "exp-" + Date.now();
      data.expenses.unshift(expense);
    }
    this.saveData(data);
    return expense;
  }

  // Caixa
  getCash() {
    return this.getData().cash || {};
  }

  openCash(initialAmount, operatorName) {
    const data = this.getData();
    const todayISO = new Date().toISOString().slice(0, 10);
    const nowBR = formatDateTimeBR(new Date());

    data.cash = {
      status: "ABERTO",
      openedAt: nowBR,
      closedAt: null,
      initialAmount: Number(initialAmount) || 0,
      openedBy: operatorName || "Operador",
      closedBy: null,
      movements: [
        {
          id: "mov-" + Date.now(),
          type: "SUPRIMENTO",
          amount: Number(initialAmount) || 0,
          description: "Fundo de abertura de caixa",
          timestamp: nowBR,
          operator: operatorName || "Operador",
        },
      ],
    };
    this.saveData(data);
    return data.cash;
  }

  closeCash(finalAmount, operatorName, notes) {
    const data = this.getData();
    const nowBR = formatDateTimeBR(new Date());
    data.cash.status = "FECHADO";
    data.cash.closedAt = nowBR;
    data.cash.closedBy = operatorName || "Operador";
    data.cash.finalActualAmount = Number(finalAmount) || 0;
    data.cash.closeNotes = notes || "";
    this.saveData(data);
    return data.cash;
  }

  addCashMovement(type, amount, description, operatorName) {
    const data = this.getData();
    const nowBR = formatDateTimeBR(new Date());
    const movement = {
      id: "mov-" + Date.now(),
      type,
      amount: Number(amount) || 0,
      description,
      timestamp: nowBR,
      operator: operatorName || "Operador",
    };
    if (!data.cash.movements) data.cash.movements = [];
    data.cash.movements.push(movement);
    this.saveData(data);
    return movement;
  }

  // Dispositivos e Acessos
  getDevices() {
    return this.getData().devices || [];
  }

  saveDevice(device) {
    const data = this.getData();
    if (device.id) {
      const idx = data.devices.findIndex((d) => d.id === device.id);
      if (idx !== -1) data.devices[idx] = { ...data.devices[idx], ...device };
    } else {
      device.id = "dev-" + Date.now();
      device.status = "ONLINE";
      device.lastPing = new Date().toISOString();
      data.devices.push(device);
    }
    this.saveData(data);
    return device;
  }

  getAccessEvents() {
    return this.getData().accessEvents || [];
  }

  logAccessEvent(event) {
    const data = this.getData();
    event.id = "acc-" + Date.now();
    event.timestamp = new Date().toISOString();
    if (!data.accessEvents) data.accessEvents = [];
    data.accessEvents.unshift(event);
    this.saveData(data);
    return event;
  }

  // Usuários
  getUsers() {
    return this.getData().users || [];
  }

  saveUser(user) {
    const data = this.getData();
    if (user.id) {
      const idx = data.users.findIndex((u) => u.id === user.id);
      if (idx !== -1) data.users[idx] = { ...data.users[idx], ...user };
    } else {
      user.id = "usr-" + Date.now();
      user.active = true;
      data.users.push(user);
    }
    this.saveData(data);
    return user;
  }

  // Configurações
  getSettings() {
    return this.getData().settings || {};
  }

  saveSettings(settings) {
    const data = this.getData();
    data.settings = { ...data.settings, ...settings };
    this.saveData(data);
    return data.settings;
  }
}

// Instância Global
const fitStorage = new FitStorage();
