// Datos de medicamentos
const medicamentos = {
  "Paracetamol": { dosisMax: 4000, unidad: "mg", categoria: "Analgésicos" },
  "Ibuprofeno": { dosisMax: 2400, unidad: "mg", categoria: "Analgésicos" },
  "Aspirina": { dosisMax: 4000, unidad: "mg", categoria: "Analgésicos" },
  "Amoxicilina": { dosisMax: 3000, unidad: "mg", categoria: "Antibióticos" },
  "Azitromicina": { dosisMax: 500, unidad: "mg", categoria: "Antibióticos" },
  "Loratadina": { dosisMax: 10, unidad: "mg", categoria: "Antihistamínicos" },
  "Clorfenamina": { dosisMax: 24, unidad: "mg", categoria: "Antihistamínicos" },
  "Metformina": { dosisMax: 2550, unidad: "mg", categoria: "Otros" },
  "Omeprazol": { dosisMax: 40, unidad: "mg", categoria: "Otros" },
};

// Estado de la aplicación
const state = {
  chart: null,
  history: JSON.parse(localStorage.getItem("historial")) || []
};

// Sistema de notificaciones
function showNotification(message, type) {
  const notification = document.querySelector('.notification');
  notification.textContent = message;
  notification.className = `notification ${type} show`;
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Inicializar tema
function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
  }
}

// Actualizar información de dosis máxima
function updateMaxDoseInfo() {
  const medName = document.getElementById("medDropdown").value;
  const med = medicamentos[medName];
  document.getElementById("maxDoseInfo").textContent = `Máx: ${med.dosisMax} ${med.unidad}`;
}

// Verificar seguridad de dosis
function checkDoseSafety() {
  const medName = document.getElementById("medDropdown").value;
  const dosis = parseFloat(document.getElementById("dosisInput").value);
  const alertEl = document.getElementById("dosisAlert");
  
  if (isNaN(dosis)) {
    alertEl.classList.add('hidden');
    return;
  }
  
  const med = medicamentos[medName];
  const percentage = (dosis / med.dosisMax) * 100;
  
  if (dosis > med.dosisMax) {
    alertEl.className = 'dosis-alert danger';
    document.getElementById("alertText").innerHTML = `¡Advertencia! La dosis diaria (${dosis} ${med.unidad}) supera el máximo recomendado de ${med.dosisMax} ${med.unidad}`;
    alertEl.classList.remove('hidden');
    return 'danger';
  } else if (percentage > 80) {
    alertEl.className = 'dosis-alert warning';
    document.getElementById("alertText").innerHTML = `Precaución: La dosis diaria (${dosis} ${med.unidad}) está cerca del máximo recomendado (${med.dosisMax} ${med.unidad})`;
    alertEl.classList.remove('hidden');
    return 'warning';
  } else {
    alertEl.classList.add('hidden');
    return 'safe';
  }
}

// Función principal de cálculo
function calcular() {
  const nombre = document.getElementById("medDropdown").value;
  const dosis = parseFloat(document.getElementById("dosisInput").value);
  const cantidad = parseFloat(document.getElementById("cantidadInput").value);

  if (isNaN(dosis) || isNaN(cantidad)) {
    showNotification("Por favor ingresa valores válidos", "error");
    return;
  }

  if (dosis <= 0 || cantidad <= 0) {
    showNotification("Los valores deben ser positivos", "error");
    return;
  }

  const safetyStatus = checkDoseSafety();
  const dias = Math.floor(cantidad / dosis);
  const med = medicamentos[nombre];
  
  const resEl = document.getElementById("result");
  let resultHTML = `
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <div class="text-sm text-gray-600 dark:text-gray-400">Medicamento</div>
        <div class="font-bold text-lg">${nombre}</div>
      </div>
      <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <div class="text-sm text-gray-600 dark:text-gray-400">Dosis diaria</div>
        <div class="font-bold text-lg">${dosis} ${med.unidad}</div>
      </div>
      <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <div class="text-sm text-gray-600 dark:text-gray-400">Cantidad total</div>
        <div class="font-bold text-lg">${cantidad} ${med.unidad}</div>
      </div>
      <div class="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
        <div class="text-sm text-blue-600 dark:text-blue-300">Duración</div>
        <div class="font-bold text-xl text-blue-600 dark:text-blue-300">${dias} días</div>
      </div>
    </div>
  `;
  
  if (safetyStatus === 'warning') {
    resultHTML += `
      <div class="dosis-alert warning mt-4">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        Dosis cercana al máximo recomendado (${med.dosisMax} ${med.unidad})
      </div>
    `;
  } else if (safetyStatus === 'danger') {
    resultHTML += `
      <div class="dosis-alert danger mt-4">
        <i class="fas fa-exclamation-circle mr-2"></i>
        ¡Advertencia! Dosis diaria supera el máximo recomendado (${med.dosisMax} ${med.unidad})
      </div>
    `;
  }
  
  resEl.innerHTML = resultHTML;
  
  // Actualizar ícono basado en seguridad
  const iconEl = document.getElementById("resultIcon");
  if (safetyStatus === 'danger') {
    iconEl.className = "fas fa-exclamation-triangle text-red-500";
  } else if (safetyStatus === 'warning') {
    iconEl.className = "fas fa-exclamation-circle text-yellow-500";
  } else {
    iconEl.className = "fas fa-check-circle text-green-500";
  }

  // Añadir al historial
  const entry = {
    nombre, 
    dosis, 
    cantidad, 
    dias, 
    fecha: new Date().toLocaleString(),
    safetyStatus
  };
  
  state.history.push(entry);
  localStorage.setItem("historial", JSON.stringify(state.history));
  renderHistorial();
  renderGrafica(nombre, dias, med.dosisMax);
  
  showNotification("Cálculo completado con éxito", "success");
}

// Renderizar historial
function renderHistorial() {
  const historyEl = document.getElementById("history");
  
  if (state.history.length === 0) {
    historyEl.innerHTML = `
      <div class="text-center py-8 text-gray-500 dark:text-gray-400">
        <i class="fas fa-history text-3xl mb-3"></i>
        <p>No hay cálculos en el historial</p>
      </div>
    `;
    return;
  }
  
  historyEl.innerHTML = '';
  
  // Mostrar las últimas 8 entradas
  state.history.slice(-8).reverse().forEach(entry => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";
    
    let safetyIcon = "";
    if (entry.safetyStatus === 'danger') {
      safetyIcon = '<i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>';
    } else if (entry.safetyStatus === 'warning') {
      safetyIcon = '<i class="fas fa-exclamation-circle text-yellow-500 mr-2"></i>';
    } else {
      safetyIcon = '<i class="fas fa-check-circle text-green-500 mr-2"></i>';
    }
    
    historyItem.innerHTML = `
      <div>
        <div class="font-medium">${entry.nombre}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">${entry.fecha}</div>
      </div>
      <div class="text-right">
        <div>${safetyIcon} <span class="font-bold">${entry.dias} días</span></div>
        <div class="text-sm text-gray-500 dark:text-gray-400">${entry.dosis}mg/día</div>
      </div>
    `;
    
    historyEl.appendChild(historyItem);
  });
}

// Renderizar gráfica
function renderGrafica(nombre, dias, dosisMax) {
  const ctx = document.getElementById("chart").getContext("2d");
  if (state.chart) state.chart.destroy();
  
  state.chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Duración calculada", "Dosis máxima diaria"],
      datasets: [{
        label: "mg",
        data: [dosisMax, dias],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 159, 64, 0.7)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: `Duración vs Dosis Máxima - ${nombre}`,
          color: '#4b5563',
          font: {
            size: 16
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y} mg`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Miligramos (mg)'
          }
        }
      }
    }
  });
}

// Exportar PDF
async function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Reporte de Cálculo de Medicamento", 105, 15, null, null, "center");
  
  // Datos
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  
  const nombre = document.getElementById("medDropdown").value;
  const dosis = document.getElementById("dosisInput").value;
  const cantidad = document.getElementById("cantidadInput").value;
  const resultado = document.getElementById("result").innerText;
  const med = medicamentos[nombre];
  
  doc.text(`Medicamento: ${nombre}`, 20, 30);
  doc.text(`Dosis diaria: ${dosis} ${med.unidad}`, 20, 40);
  doc.text(`Dosis máxima: ${med.dosisMax} ${med.unidad}`, 20, 50);
  doc.text(`Cantidad total: ${cantidad} ${med.unidad}`, 20, 60);
  
  // Añadir resultado
  doc.setFont("helvetica", "bold");
  doc.text("Resultado:", 20, 75);
  doc.setFont("helvetica", "normal");
  
  const splitResult = doc.splitTextToSize(resultado, 170);
  doc.text(splitResult, 20, 85);
  
  // Añadir imagen del gráfico
  const canvas = document.getElementById("chart");
  if (canvas) {
    const canvasImg = await html2canvas(canvas, { scale: 2 });
    const imgData = canvasImg.toDataURL("image/png");
    const imgProps = doc.getImageProperties(imgData);
    const pdfWidth = doc.internal.pageSize.getWidth() - 40;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    doc.addImage(imgData, "PNG", 20, 120, pdfWidth, pdfHeight);
  }
  
  // Pie de página
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el: ${new Date().toLocaleString()}`, 105, doc.internal.pageSize.height - 10, null, null, "center");
  
  doc.save(`reporte_medicamento_${nombre}.pdf`);
  showNotification("PDF exportado con éxito", "success");
}

// Limpiar inputs
function clearInputs() {
  document.getElementById("dosisInput").value = "";
  document.getElementById("cantidadInput").value = "";
  document.getElementById("result").innerHTML = `
    <div class="text-center py-8 text-gray-500 dark:text-gray-400">
      <i class="fas fa-capsules text-4xl mb-3"></i>
      <p>Ingrese los datos y haga clic en Calcular</p>
    </div>
  `;
  document.getElementById("dosisAlert").classList.add('hidden');
  document.getElementById("resultIcon").className = "";
  
  if (state.chart) {
    state.chart.destroy();
    state.chart = null;
  }
}

// Cambiar tema
function toggleTheme() {
  const html = document.documentElement;
  html.classList.toggle("dark");
  localStorage.setItem("theme", html.classList.contains("dark") ? "dark" : "light");
}

// Limpiar historial
function clearHistory() {
  if (state.history.length === 0) {
    showNotification("El historial ya está vacío", "warning");
    return;
  }
  
  if (confirm("¿Estás seguro de que deseas borrar todo el historial?")) {
    state.history = [];
    localStorage.removeItem("historial");
    renderHistorial();
    showNotification("Historial borrado", "success");
  }
}

// Mostrar información
function showInfo() {
  alert("Calculadora de Medicamentos\n\nEsta herramienta le permite calcular la duración de un tratamiento médico basado en la dosis diaria y la cantidad total del medicamento.\n\nPara usar:\n1. Seleccione un medicamento\n2. Ingrese la dosis diaria en mg\n3. Ingrese la cantidad total en mg\n4. Haga clic en Calcular\n\nLas dosis máximas son solo referenciales. Consulte siempre a un profesional de la salud.");
}

// Inicializar aplicación
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  updateMaxDoseInfo();
  renderHistorial();
  
  // Event listeners
  document.getElementById("calcBtn").addEventListener("click", calcular);
  document.getElementById("pdfBtn").addEventListener("click", exportarPDF);
  document.getElementById("themeToggle").addEventListener("click", toggleTheme);
  document.getElementById("clearBtn").addEventListener("click", clearInputs);
  document.getElementById("clearHistoryBtn").addEventListener("click", clearHistory);
  document.getElementById("infoBtn").addEventListener("click", showInfo);
  document.getElementById("medDropdown").addEventListener("change", updateMaxDoseInfo);
  
  // Cálculo automático al cambiar inputs
  document.getElementById("dosisInput").addEventListener("input", function() {
    checkDoseSafety();
    if (this.value && document.getElementById("cantidadInput").value) {
      calcular();
    }
  });
  
  document.getElementById("cantidadInput").addEventListener("input", function() {
    if (this.value && document.getElementById("dosisInput").value) {
      calcular();
    }
  });
});