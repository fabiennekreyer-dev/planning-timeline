import React, { useState, useRef } from 'react';
import { Plus, Trash2, Save, Upload, Download } from 'lucide-react';

export default function PlanningTimeline() {
  // Fonction pour obtenir la date du jour au format YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const svgRef = useRef(null);
  const fileInputRef = useRef(null);

  const [numWeeks, setNumWeeks] = useState(12);
  const [startDate, setStartDate] = useState(getTodayDate());
  const [numLines, setNumLines] = useState(5);
  const [planningName, setPlanningName] = useState('Mon Planning');
  
  const [resources, setResources] = useState([
    { id: 1, name: 'Ressource 1', color: '#f1aad0' },
    { id: 2, name: 'Ressource 2', color: '#bce295' },
    { id: 3, name: 'Ressource 3', color: '#d8d8d8' }
  ]);
  
  const [tasks, setTasks] = useState([]);
  
  const [milestones, setMilestones] = useState([]);
  
  const [verticalLines, setVerticalLines] = useState([]);

  const addResource = () => {
    if (resources.length < 5) {
      setResources([...resources, { id: Date.now(), name: `Ressource ${resources.length + 1}`, color: '#cccccc' }]);
    }
  };

  const updateResource = (id, field, value) => {
    setResources(resources.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const deleteResource = (id) => {
    setResources(resources.filter(r => r.id !== id));
  };

  const addTask = () => {
    setTasks([...tasks, { id: Date.now(), name: 'Nouvelle tâche', startDate: startDate, endDate: startDate, resourceId: resources[0]?.id, line: 1 }]);
  };

  const updateTask = (id, field, value) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addMilestone = () => {
    setMilestones([...milestones, { id: Date.now(), name: 'Nouveau jalon', date: startDate, type: 'meeting', line: 1 }]);
  };

  const updateMilestone = (id, field, value) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const deleteMilestone = (id) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const addVerticalLine = () => {
    setVerticalLines([...verticalLines, { id: Date.now(), date: startDate }]);
  };

  const updateVerticalLine = (id, field, value) => {
    setVerticalLines(verticalLines.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const deleteVerticalLine = (id) => {
    setVerticalLines(verticalLines.filter(v => v.id !== id));
  };

  // Sauvegarder le planning
  const savePlanning = () => {
    try {
      const planningData = {
        name: planningName,
        numWeeks,
        startDate,
        numLines,
        resources,
        tasks,
        milestones,
        verticalLines,
        savedAt: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(planningData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      
      // Nettoyer le nom du fichier
      const safeName = (planningName || 'planning').replace(/[^a-z0-9]/gi, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `${safeName}_${dateStr}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Planning sauvegardé avec succès !');
    } catch (error) {
      alert('Erreur lors de la sauvegarde : ' + error.message);
      console.error('Erreur de sauvegarde:', error);
    }
  };

  // Charger un planning
  const loadPlanning = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const planningData = JSON.parse(e.target.result);
        
        // Vérifier que les données sont valides
        if (!planningData || typeof planningData !== 'object') {
          throw new Error('Format de fichier invalide');
        }
        
        // Charger les données avec des valeurs par défaut si nécessaire
        if (planningData.name) setPlanningName(planningData.name);
        if (planningData.numWeeks) setNumWeeks(planningData.numWeeks);
        if (planningData.startDate) setStartDate(planningData.startDate);
        if (planningData.numLines) setNumLines(planningData.numLines);
        if (planningData.resources && Array.isArray(planningData.resources)) setResources(planningData.resources);
        if (planningData.tasks && Array.isArray(planningData.tasks)) setTasks(planningData.tasks);
        if (planningData.milestones && Array.isArray(planningData.milestones)) setMilestones(planningData.milestones);
        if (planningData.verticalLines && Array.isArray(planningData.verticalLines)) setVerticalLines(planningData.verticalLines);
        
        alert('Planning chargé avec succès !');
      } catch (error) {
        alert('Erreur lors du chargement du planning : ' + error.message);
        console.error('Erreur de chargement:', error);
      }
    };
    
    reader.onerror = () => {
      alert('Erreur lors de la lecture du fichier');
    };
    
    reader.readAsText(file);
    
    // Réinitialiser l'input pour permettre de charger le même fichier à nouveau
    if (event.target) {
      event.target.value = '';
    }
  };

  // Exporter en image PNG
  const exportToPNG = () => {
    try {
      const svg = svgRef.current;
      if (!svg) {
        alert('Planning non disponible pour l\'export');
        return;
      }

      // Cloner le SVG pour ne pas modifier l'original
      const svgClone = svg.cloneNode(true);
      
      // Masquer les lignes horizontales et leurs labels dans le clone
      const guidelines = svgClone.querySelectorAll('line[stroke-dasharray="3,3"]');
      guidelines.forEach(line => line.style.display = 'none');
      
      const lineLabels = svgClone.querySelectorAll('text[text-anchor="middle"]');
      lineLabels.forEach(text => {
        if (text.textContent && text.textContent.match(/^L\d+$/)) {
          text.style.display = 'none';
        }
      });

      const svgData = new XMLSerializer().serializeToString(svgClone);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = svg.width.baseVal.value;
      canvas.height = svg.height.baseVal.value;

      img.onload = () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          
          const safeName = (planningName || 'planning').replace(/[^a-z0-9]/gi, '_');
          const dateStr = new Date().toISOString().split('T')[0];
          link.download = `${safeName}_${dateStr}.png`;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          alert('Export PNG réussi !');
        });
      };

      img.onerror = () => {
        alert('Erreur lors de la génération de l\'image');
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      alert('Erreur lors de l\'export PNG : ' + error.message);
      console.error('Erreur d\'export:', error);
    }
  };

  // Imprimer le planning
  const printPlanning = () => {
    try {
      const svg = svgRef.current;
      if (!svg) {
        alert('Planning non disponible pour l\'impression');
        return;
      }

      // Convertir le SVG en image pour l'impression
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = svg.width.baseVal.value;
      canvas.height = svg.height.baseVal.value;

      img.onload = () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        const imageData = canvas.toDataURL('image/png');
        
        // Créer le HTML pour le nouvel onglet
        const printHTML = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Impression - ${planningName}</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body {
                  margin: 0;
                  padding: 20px;
                  background: #f5f5f5;
                  font-family: Arial, sans-serif;
                }
                .container {
                  max-width: 1400px;
                  margin: 0 auto;
                  background: white;
                  padding: 30px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                h2 {
                  text-align: center;
                  margin-bottom: 30px;
                  color: #333;
                  font-size: 24px;
                }
                img {
                  max-width: 100%;
                  height: auto;
                  display: block;
                  margin: 0 auto;
                  border: 1px solid #ddd;
                }
                .buttons {
                  text-align: center;
                  margin-top: 30px;
                  display: flex;
                  gap: 15px;
                  justify-content: center;
                }
                button {
                  padding: 12px 24px;
                  font-size: 16px;
                  border: none;
                  border-radius: 5px;
                  cursor: pointer;
                  font-weight: 500;
                }
                .print-btn {
                  background: #4CAF50;
                  color: white;
                }
                .print-btn:hover {
                  background: #45a049;
                }
                .close-btn {
                  background: #f44336;
                  color: white;
                }
                .close-btn:hover {
                  background: #da190b;
                }
                @media print {
                  body {
                    background: white;
                    padding: 0;
                  }
                  .container {
                    box-shadow: none;
                    padding: 0;
                  }
                  .buttons {
                    display: none;
                  }
                  img {
                    border: none;
                  }
                  @page {
                    size: landscape;
                    margin: 0.5cm;
                  }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>${planningName}</h2>
                <img src="${imageData}" alt="Planning" />
                <div class="buttons">
                  <button class="print-btn" onclick="window.print()">🖨️ Imprimer / Enregistrer en PDF</button>
                  <button class="close-btn" onclick="window.close()">✖️ Fermer</button>
                </div>
              </div>
            </body>
          </html>
        `;
        
        // Ouvrir dans un nouvel onglet
        const blob = new Blob([printHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Nettoyer l'URL après un délai
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      };

      img.onerror = () => {
        alert('Erreur lors de la génération de l\'aperçu d\'impression');
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      
    } catch (error) {
      alert('Erreur lors de l\'impression : ' + error.message);
      console.error('Erreur d\'impression:', error);
    }
  };

  const getMilestoneIcon = (type) => {
    switch(type) {
      case 'meeting': return { emoji: '👥', color: '#3498db' };
      case 'document': return { emoji: '📄', color: '#f39c12' };
      case 'app': return { emoji: '📱', color: '#9b59b6' };
      case 'production': return { emoji: '⭐', color: '#e74c3c', textColor: '#e74c3c' };
      case 'divers': return { emoji: '🚩', color: '#3498db' };
      default: return { emoji: '📅', color: '#95a5a6' };
    }
  };

  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
  };

  const getMonthLabel = (weekIndex) => {
    const start = new Date(startDate);
    start.setDate(start.getDate() + (weekIndex * 7));
    return start.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const getTaskPosition = (dateString) => {
    const taskDate = new Date(dateString);
    const timelineStart = new Date(startDate);
    const daysDiff = Math.floor((taskDate - timelineStart) / (24 * 60 * 60 * 1000));
    const weeksDiff = daysDiff / 7;
    return weeksDiff;
  };

  const getMilestonePosition = (dateString) => {
    const milestoneDate = new Date(dateString);
    const timelineStart = new Date(startDate);
    const daysDiff = Math.floor((milestoneDate - timelineStart) / (24 * 60 * 60 * 1000));
    const weeksDiff = daysDiff / 7;
    return weeksDiff;
  };

  const maxLine = numLines;

  return (
    <div className="w-full h-screen overflow-auto bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Générateur de Planning Timeline</h1>
          <input
            type="text"
            value={planningName}
            onChange={(e) => setPlanningName(e.target.value)}
            className="border rounded px-3 py-2 text-lg font-semibold"
            placeholder="Nom du planning"
          />
        </div>
        
        {/* Boutons d'actions */}
        <div className="flex gap-2">
          <button
            onClick={savePlanning}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            title="Sauvegarder le planning"
          >
            <Save className="w-4 h-4" />
            Sauvegarder
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={loadPlanning}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            title="Charger un planning"
          >
            <Upload className="w-4 h-4" />
            Charger
          </button>
          
          <button
            onClick={exportToPNG}
            className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            title="Exporter en PNG"
          >
            <Download className="w-4 h-4" />
            Export PNG
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Section Timeline */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            Configuration Timeline
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre de semaines</label>
              <input
                type="number"
                value={numWeeks}
                onChange={(e) => setNumWeeks(parseInt(e.target.value) || 1)}
                className="w-full border rounded px-3 py-2"
                min="1"
                max="104"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date de début</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nombre de lignes horizontales</label>
              <input
                type="number"
                value={numLines}
                onChange={(e) => setNumLines(parseInt(e.target.value) || 1)}
                className="w-full border rounded px-3 py-2"
                min="1"
                max="10"
              />
            </div>
          </div>
        </div>

        {/* Section Types de Ressources */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Types de Ressources (max 5)</h2>
          <div className="space-y-3 mb-4">
            {resources.map(resource => (
              <div key={resource.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={resource.name}
                  onChange={(e) => updateResource(resource.id, 'name', e.target.value)}
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Nom"
                />
                <input
                  type="color"
                  value={resource.color}
                  onChange={(e) => updateResource(resource.id, 'color', e.target.value)}
                  className="w-16 h-10 border rounded cursor-pointer"
                />
                <button
                  onClick={() => deleteResource(resource.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          {resources.length < 5 && (
            <button
              onClick={addResource}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              Ajouter une ressource
            </button>
          )}
        </div>
      </div>

      {/* Section Tâches */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Barres de Tâches</h2>
        <div className="space-y-3 mb-4">
          {tasks.map(task => (
            <div key={task.id} className="flex gap-2 items-center flex-wrap">
              <input
                type="text"
                value={task.name}
                onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                className="flex-1 min-w-[200px] border rounded px-3 py-2"
                placeholder="Nom de la tâche"
              />
              <input
                type="date"
                value={task.startDate}
                onChange={(e) => updateTask(task.id, 'startDate', e.target.value)}
                className="w-40 border rounded px-3 py-2"
              />
              <input
                type="date"
                value={task.endDate}
                onChange={(e) => updateTask(task.id, 'endDate', e.target.value)}
                className="w-40 border rounded px-3 py-2"
              />
              <select
                value={task.resourceId}
                onChange={(e) => updateTask(task.id, 'resourceId', parseInt(e.target.value))}
                className="border rounded px-3 py-2"
              >
                {resources.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <select
                value={task.line}
                onChange={(e) => updateTask(task.id, 'line', parseInt(e.target.value))}
                className="w-24 border rounded px-3 py-2"
              >
                {Array.from({ length: numLines }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>L{i + 1}</option>
                ))}
              </select>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addTask}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          <Plus className="w-4 h-4" />
          Ajouter une tâche
        </button>
      </div>

      {/* Section Jalons */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Jalons</h2>
        <div className="space-y-3 mb-4">
          {milestones.map(milestone => (
            <div key={milestone.id} className="flex gap-2 items-center flex-wrap">
              <input
                type="text"
                value={milestone.name}
                onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)}
                className="flex-1 min-w-[200px] border rounded px-3 py-2"
                placeholder="Nom du jalon"
              />
              <input
                type="date"
                value={milestone.date}
                onChange={(e) => updateMilestone(milestone.id, 'date', e.target.value)}
                className="w-40 border rounded px-3 py-2"
              />
              <select
                value={milestone.type}
                onChange={(e) => updateMilestone(milestone.id, 'type', e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="meeting">👥 Réunion</option>
                <option value="document">📄 Document</option>
                <option value="app">📱 Application</option>
                <option value="production">⭐ Mise en production</option>
                <option value="divers">◆ Divers</option>
              </select>
              <select
                value={milestone.line}
                onChange={(e) => updateMilestone(milestone.id, 'line', parseInt(e.target.value))}
                className="w-24 border rounded px-3 py-2"
              >
                {Array.from({ length: numLines }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>L{i + 1}</option>
                ))}
              </select>
              <button
                onClick={() => deleteMilestone(milestone.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addMilestone}
          className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          <Plus className="w-4 h-4" />
          Ajouter un jalon
        </button>
      </div>

      {/* Section Lignes verticales */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Lignes Verticales</h2>
        <div className="space-y-3 mb-4">
          {verticalLines.map(vLine => (
            <div key={vLine.id} className="flex gap-2 items-center">
              <input
                type="date"
                value={vLine.date}
                onChange={(e) => updateVerticalLine(vLine.id, 'date', e.target.value)}
                className="w-40 border rounded px-3 py-2"
              />
              <button
                onClick={() => deleteVerticalLine(vLine.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addVerticalLine}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          <Plus className="w-4 h-4" />
          Ajouter une ligne verticale
        </button>
      </div>

      {/* Visualisation du Planning */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Aperçu du Planning</h2>
        <div className="overflow-x-auto">
          <svg ref={svgRef} width={numWeeks * 40 + 100} height={numLines * 40 + 200} className="border">
            {/* Légende des ressources en haut */}
            <g>
              <text x="50" y="25" fontSize="12" fontWeight="bold" fill="#333">Légende :</text>
              {resources.map((resource, index) => (
                <g key={resource.id}>
                  <rect
                    x={130 + index * 150}
                    y="15"
                    width="15"
                    height="15"
                    fill={resource.color}
                    opacity="0.7"
                    rx="2"
                  />
                  <text
                    x={150 + index * 150}
                    y="27"
                    fontSize="11"
                    fill="#333"
                  >
                    {resource.name}
                  </text>
                </g>
              ))}
            </g>
            
            {/* Lignes horizontales - L1 en bas, L5 en haut */}
            {Array.from({ length: numLines }).map((_, index) => {
              const lineNumber = index + 1;
              const y = 130 + (numLines - lineNumber) * 40;
              
              return (
                <g key={`line-${lineNumber}`}>
                  <line
                    x1="50"
                    y1={y}
                    x2={numWeeks * 40 + 50}
                    y2={y}
                    stroke="#e0e0e0"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                  <text
                    x="30"
                    y={y + 5}
                    fontSize="10"
                    fill="#666"
                    textAnchor="middle"
                  >
                    L{lineNumber}
                  </text>
                </g>
              );
            })}
            
            {/* Timeline horizontale */}
            <line x1="50" y1={130 + numLines * 40} x2={numWeeks * 40 + 50} y2={130 + numLines * 40} stroke="#333" strokeWidth="2" />

            {/* Lignes verticales automatiques sur les jalons (fines en pointillés) */}
            {milestones.map(milestone => {
              const relativeWeek = getMilestonePosition(milestone.date);
              if (relativeWeek < 0 || relativeWeek >= numWeeks) return null;
              
              const timelineY = 130 + numLines * 40;
              const x = 50 + relativeWeek * 40 + 20;
              
              return (
                <line
                  key={`vline-${milestone.id}`}
                  x1={x}
                  y1="50"
                  x2={x}
                  y2={timelineY + 50}
                  stroke="#999"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              );
            })}

            {/* Lignes verticales personnalisées (épaisses et pleines) */}
            {verticalLines.map(vLine => {
              const relativeWeek = getTaskPosition(vLine.date);
              if (relativeWeek < 0 || relativeWeek >= numWeeks) return null;
              
              const timelineY = 130 + numLines * 40;
              const x = 50 + relativeWeek * 40 + 20;
              
              return (
                <line
                  key={`custom-vline-${vLine.id}`}
                  x1={x}
                  y1="50"
                  x2={x}
                  y2={timelineY + 50}
                  stroke="#4a4a4a"
                  strokeWidth="4"
                />
              );
            })}

            {/* Barres de tâches */}
            {tasks.map(task => {
              const resource = resources.find(r => r.id === task.resourceId);
              const taskLine = Math.min(Math.max(task.line, 1), numLines);
              const y = 130 + (numLines - taskLine) * 40;
              
              const startPos = getTaskPosition(task.startDate);
              const endPos = getTaskPosition(task.endDate);
              
              if (startPos >= numWeeks || endPos < 0) return null;
              
              const x1 = 50 + startPos * 40 + 20;
              const x2 = 50 + endPos * 40 + 20;
              
              // Formater les dates au format jj/mm/aa
              const formatDateShort = (dateStr) => {
                const date = new Date(dateStr);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = String(date.getFullYear()).slice(-2);
                return `${day}/${month}/${year}`;
              };
              
              return (
                <g key={task.id}>
                  <rect
                    x={x1}
                    y={y - 15}
                    width={x2 - x1}
                    height="30"
                    fill={resource?.color || '#ccc'}
                    opacity="0.7"
                    rx="5"
                  />
                  <text
                    x={x1 + 5}
                    y={y + 5}
                    fontSize="10"
                    fill="#333"
                  >
                    {task.name}
                  </text>
                  {/* Date de fin sous la tâche */}
                  <text
                    x={x2}
                    y={y + 25}
                    fontSize="8"
                    fill="#666"
                    textAnchor="middle"
                  >
                    {formatDateShort(task.endDate)}
                  </text>
                </g>
              );
            })}

            {/* Semaines et mois */}
            {(() => {
              const timelineY = 130 + numLines * 40;
              let lastMonthLabel = '';
              return Array.from({ length: numWeeks }).map((_, i) => {
                const isMonth = i % 4 === 0;
                const currentDate = new Date(startDate);
                currentDate.setDate(currentDate.getDate() + (i * 7));
                const weekNum = getWeekNumber(currentDate);
                const monthLabel = getMonthLabel(i);
                const showMonth = isMonth && monthLabel !== lastMonthLabel;
                if (showMonth) lastMonthLabel = monthLabel;
                
                return (
                  <g key={i}>
                    <circle
                      cx={50 + i * 40 + 20}
                      cy={timelineY}
                      r={isMonth ? 6 : 3}
                      fill={isMonth ? '#333' : '#666'}
                    />
                    <text
                      x={50 + i * 40 + 20}
                      y={timelineY + 20}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#666"
                    >
                      S{weekNum}
                    </text>
                    {showMonth && (
                      <text
                        x={50 + i * 40 + 20}
                        y={timelineY + 35}
                        textAnchor="middle"
                        fontSize="14"
                        fill="#333"
                        fontWeight="bold"
                      >
                        {monthLabel}
                      </text>
                    )}
                  </g>
                );
              });
            })()}

            {/* Jalons */}
            {milestones.map(milestone => {
              const relativeWeek = getMilestonePosition(milestone.date);
              if (relativeWeek < 0 || relativeWeek >= numWeeks) return null;
              
              const x = 50 + relativeWeek * 40 + 20;
              const milestoneLine = Math.min(Math.max(milestone.line || 1, 1), numLines);
              const y = 130 + (numLines - milestoneLine) * 40;
              const iconInfo = getMilestoneIcon(milestone.type);
              
              // Formater la date
              const dateObj = new Date(milestone.date);
              const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
              
              return (
                <g key={milestone.id}>
                  {/* Formes SVG pour "production" et "divers", emoji pour les autres */}
                  {milestone.type === 'production' ? (
                    <polygon
                      points={`${x},${y-12} ${x+3.5},${y-3.5} ${x+12},${y-3.5} ${x+5},${y+2} ${x+7.5},${y+11} ${x},${y+6} ${x-7.5},${y+11} ${x-5},${y+2} ${x-12},${y-3.5} ${x-3.5},${y-3.5}`}
                      fill="#e74c3c"
                    />
                  ) : milestone.type === 'divers' ? (
                    <g>
                      {/* Losange bleu */}
                      <polygon
                        points={`${x},${y-12} ${x+8},${y} ${x},${y+12} ${x-8},${y}`}
                        fill="#3498db"
                      />
                    </g>
                  ) : (
                    <text
                      x={x}
                      y={y + 8}
                      textAnchor="middle"
                      fontSize="24"
                    >
                      {iconInfo.emoji}
                    </text>
                  )}
                  {/* Nom du jalon au-dessus */}
                  <text
                    x={x}
                    y={y - 25}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="#333"
                  >
                    {milestone.name}
                  </text>
                  {/* Date en-dessous */}
                  <text
                    x={x}
                    y={y + 32}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#333"
                  >
                    {formattedDate}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
