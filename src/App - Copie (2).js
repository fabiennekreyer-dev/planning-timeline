import './App.css';
import React, { useState, useRef } from 'react';
import { Plus, Trash2, Save, Upload, Download } from 'lucide-react';
import { useToast, ToastContainer } from './components/Toast';

export default function PlanningTimeline() {
  // Hook pour les notifications toast
  const { toasts, addToast, removeToast } = useToast();

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

      const safeName = (planningName || 'planning').replace(/[^a-z0-9]/gi, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `${safeName}_${dateStr}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast('Planning sauvegardé avec succès !', 'success');
    } catch (error) {
      addToast('Erreur lors de la sauvegarde : ' + error.message, 'error');
      console.error('Erreur de sauvegarde:', error);
    }
  };

  const loadPlanning = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const planningData = JSON.parse(e.target.result);

        if (!planningData || typeof planningData !== 'object') {
          throw new Error('Format de fichier invalide');
        }

        if (planningData.name) setPlanningName(planningData.name);
        if (planningData.numWeeks) setNumWeeks(planningData.numWeeks);
        if (planningData.startDate) setStartDate(planningData.startDate);
        if (planningData.numLines) setNumLines(planningData.numLines);
        if (planningData.resources && Array.isArray(planningData.resources)) setResources(planningData.resources);
        if (planningData.tasks && Array.isArray(planningData.tasks)) setTasks(planningData.tasks);
        if (planningData.milestones && Array.isArray(planningData.milestones)) setMilestones(planningData.milestones);
        if (planningData.verticalLines && Array.isArray(planningData.verticalLines)) setVerticalLines(planningData.verticalLines);

        addToast('Planning chargé avec succès !', 'success');
      } catch (error) {
        addToast('Erreur lors du chargement du planning : ' + error.message, 'error');
        console.error('Erreur de chargement:', error);
      }
    };

    reader.onerror = () => {
      addToast('Erreur lors de la lecture du fichier', 'error');
    };

    reader.readAsText(file);

    if (event.target) {
      event.target.value = '';
    }
  };

  const exportToPNG = () => {
    try {
      const svg = svgRef.current;
      if (!svg) {
        addToast('Planning non disponible pour l\'export', 'warning');
        return;
      }

      const svgClone = svg.cloneNode(true);

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

          addToast('Export PNG réussi !', 'success');
        });
      };

      img.onerror = () => {
        addToast('Erreur lors de la génération de l\'image', 'error');
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      addToast('Erreur lors de l\'export PNG : ' + error.message, 'error');
      console.error('Erreur d\'export:', error);
    }
  };

  const getMilestoneIcon = (type) => {
    switch(type) {
      case 'meeting': return { emoji: '👥', color: '#3498db' };
      case 'document': return { emoji: '📄', color: '#f39c12' };
      case 'app': return { emoji: '📱', color: '#9b59b6' };
      case 'production': return { emoji: '⭐', color: '#e74c3c', textColor: '#e74c3c' };
      case 'divers': return { emoji: '◆', color: '#3498db' };
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

  // Calcul de la largeur dynamique par semaine avec limites
  const getWeekWidth = () => {
    const MIN_WEEK_WIDTH = 30; // Largeur minimale par semaine
    const CONTAINER_WIDTH = 1200; // Largeur de référence du conteneur
    const MARGIN = 100; // Marge pour les labels à gauche
    
    const availableWidth = CONTAINER_WIDTH - MARGIN;
    const calculatedWidth = availableWidth / numWeeks;
    
    // Appliquer uniquement la limite MIN (pas de MAX)
    return Math.max(calculatedWidth, MIN_WEEK_WIDTH);
  };

  const weekWidth = getWeekWidth();
  const leftMargin = 50; // Marge à gauche pour les labels

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
    <div className="app-container">
      {/* Conteneur de notifications toast */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="app-header">
        <div className="header-left">
          <h1 className="app-title">Générateur de Planning Timeline</h1>
          <input
            type="text"
            value={planningName}
            onChange={(e) => setPlanningName(e.target.value)}
            className="planning-name-input"
            placeholder="Nom du planning"
          />
        </div>

        <div className="header-actions">
          <button onClick={savePlanning} className="btn btn-blue" title="Sauvegarder le planning">
            <Save className="icon" />
            Sauvegarder
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={loadPlanning}
            className="hidden-input"
          />
          <button onClick={() => fileInputRef.current?.click()} className="btn btn-green" title="Charger un planning">
            <Upload className="icon" />
            Charger
          </button>

          <button onClick={exportToPNG} className="btn btn-purple" title="Exporter en PNG">
            <Download className="icon" />
            Export PNG
          </button>
        </div>
      </div>


      {/* Layout principal : 2 colonnes */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* COLONNE GAUCHE : Sections de configuration */}
        <div style={{ flex: '0 0 40%', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
          
          {/* Configuration Timeline */}
          <div className="section-card" style={{ marginBottom: '16px' }}>
            <h2 className="section-title">Configuration Timeline</h2>
            <div className="form-group">
              <label className="form-label">Nombre de semaines</label>
              <input
                type="number"
                value={numWeeks}
                onChange={(e) => setNumWeeks(parseInt(e.target.value) || 1)}
                className="form-input"
                style={{ width: '120px' }}
                min="1"
                max="104"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date de début</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input"
                style={{ width: '160px' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nombre de lignes</label>
              <input
                type="number"
                value={numLines}
                onChange={(e) => setNumLines(parseInt(e.target.value) || 1)}
                className="form-input"
                style={{ width: '120px' }}
                min="1"
                max="10"
              />
            </div>
          </div>

          {/* Ressources */}
          <div className="section-card" style={{ marginBottom: '16px' }}>
            <h2 className="section-title">Types de Ressources (max 5)</h2>
            
            {/* En-têtes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 40px', gap: '8px', marginBottom: '8px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Nom</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Couleur</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}></div>
            </div>

            <div className="item-list">
              {resources.map(resource => (
                <div key={resource.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 40px', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={resource.name}
                    onChange={(e) => updateResource(resource.id, 'name', e.target.value)}
                    className="form-input"
                    placeholder="Nom"
                    style={{ fontSize: '13px', padding: '6px 10px' }}
                  />
                  <input
                    type="color"
                    value={resource.color}
                    onChange={(e) => updateResource(resource.id, 'color', e.target.value)}
                    className="color-picker"
                    style={{ width: '80px', height: '34px' }}
                  />
                  <button
                    onClick={() => deleteResource(resource.id)}
                    className="btn btn-red"
                    style={{ padding: '6px', height: '34px', width: '34px' }}
                    title="Supprimer"
                  >
                    <Trash2 className="icon" style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              ))}
            </div>
            {resources.length < 5 && (
              <button onClick={addResource} className="btn btn-blue" style={{ fontSize: '13px', padding: '6px 12px' }}>
                <Plus className="icon" style={{ width: '14px', height: '14px' }} />
                Ajouter
              </button>
            )}
          </div>

          {/* Barres de tâches */}
          <div className="section-card" style={{ marginBottom: '16px' }}>
            <h2 className="section-title">Barres de tâches</h2>
            
            {/* En-têtes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 100px 100px 110px 70px 40px', gap: '6px', marginBottom: '8px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb', fontSize: '11px', fontWeight: '600', color: '#6b7280' }}>
              <div>Nom</div>
              <div>Début</div>
              <div>Fin</div>
              <div>Ressource</div>
              <div>Position</div>
              <div></div>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {tasks.map(task => (
                <div key={task.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 100px 100px 110px 70px 40px', gap: '6px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={task.name}
                    onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                    className="form-input"
                    placeholder="Nom"
                    style={{ fontSize: '12px', padding: '5px 8px' }}
                  />
                  <input
                    type="date"
                    value={task.startDate}
                    onChange={(e) => updateTask(task.id, 'startDate', e.target.value)}
                    className="form-input"
                    style={{ fontSize: '11px', padding: '5px 6px' }}
                  />
                  <input
                    type="date"
                    value={task.endDate}
                    onChange={(e) => updateTask(task.id, 'endDate', e.target.value)}
                    className="form-input"
                    style={{ fontSize: '11px', padding: '5px 6px' }}
                  />
                  <select
                    value={task.resourceId}
                    onChange={(e) => updateTask(task.id, 'resourceId', parseInt(e.target.value))}
                    className="form-select"
                    style={{ fontSize: '12px', padding: '5px 6px' }}
                  >
                    {resources.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={task.line}
                    onChange={(e) => updateTask(task.id, 'line', parseInt(e.target.value) || 1)}
                    className="form-input"
                    min="1"
                    max={maxLine}
                    style={{ fontSize: '12px', padding: '5px 8px' }}
                  />
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="btn btn-red"
                    style={{ padding: '5px', height: '30px', width: '30px' }}
                    title="Supprimer"
                  >
                    <Trash2 className="icon" style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addTask} className="btn btn-green" style={{ fontSize: '13px', padding: '6px 12px', marginTop: '8px' }}>
              <Plus className="icon" style={{ width: '14px', height: '14px' }} />
              Ajouter
            </button>
          </div>

          {/* Jalons */}
          <div className="section-card" style={{ marginBottom: '16px' }}>
            <h2 className="section-title">Jalons</h2>
            
            {/* En-têtes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 100px 100px 70px 40px', gap: '6px', marginBottom: '8px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb', fontSize: '11px', fontWeight: '600', color: '#6b7280' }}>
              <div>Nom</div>
              <div>Date</div>
              <div>Icône</div>
              <div>Position</div>
              <div></div>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {milestones.map(milestone => (
                <div key={milestone.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 100px 100px 70px 40px', gap: '6px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={milestone.name}
                    onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)}
                    className="form-input"
                    placeholder="Nom"
                    style={{ fontSize: '12px', padding: '5px 8px' }}
                  />
                  <input
                    type="date"
                    value={milestone.date}
                    onChange={(e) => updateMilestone(milestone.id, 'date', e.target.value)}
                    className="form-input"
                    style={{ fontSize: '11px', padding: '5px 6px' }}
                  />
                  <select
                    value={milestone.type}
                    onChange={(e) => updateMilestone(milestone.id, 'type', e.target.value)}
                    className="form-select"
                    style={{ fontSize: '11px', padding: '5px 6px' }}
                  >
                    <option value="meeting">👥 Réunion</option>
                    <option value="document">📄 Document</option>
                    <option value="app">📱 App</option>
                    <option value="production">⭐ Prod</option>
                    <option value="divers">◆ Divers</option>
                  </select>
                  <input
                    type="number"
                    value={milestone.line || 1}
                    onChange={(e) => updateMilestone(milestone.id, 'line', parseInt(e.target.value) || 1)}
                    className="form-input"
                    min="1"
                    max={maxLine}
                    style={{ fontSize: '12px', padding: '5px 8px' }}
                  />
                  <button
                    onClick={() => deleteMilestone(milestone.id)}
                    className="btn btn-red"
                    style={{ padding: '5px', height: '30px', width: '30px' }}
                    title="Supprimer"
                  >
                    <Trash2 className="icon" style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addMilestone} className="btn btn-purple" style={{ fontSize: '13px', padding: '6px 12px', marginTop: '8px' }}>
              <Plus className="icon" style={{ width: '14px', height: '14px' }} />
              Ajouter
            </button>
          </div>

          {/* Lignes verticales */}
          <div className="section-card">
            <h2 className="section-title">Lignes verticales personnalisées</h2>
            <div className="item-list">
              {verticalLines.map(vLine => (
                <div key={vLine.id} className="item-row" style={{ marginBottom: '8px' }}>
                  <input
                    type="date"
                    value={vLine.date}
                    onChange={(e) => updateVerticalLine(vLine.id, 'date', e.target.value)}
                    className="form-input"
                    style={{ flex: 1, fontSize: '12px', padding: '6px 10px' }}
                  />
                  <button
                    onClick={() => deleteVerticalLine(vLine.id)}
                    className="btn btn-red"
                    style={{ padding: '6px', width: '34px', height: '34px' }}
                    title="Supprimer"
                  >
                    <Trash2 className="icon" style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addVerticalLine} className="btn btn-orange" style={{ fontSize: '13px', padding: '6px 12px', marginTop: '8px' }}>
              <Plus className="icon" style={{ width: '14px', height: '14px' }} />
              Ajouter
            </button>
          </div>

        </div>

        {/* COLONNE DROITE : Aperçu du Planning */}
        <div style={{ flex: '1', background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
          <h2 className="section-title">Aperçu du Planning</h2>
          <div className="svg-container">
            <svg ref={svgRef} width={numWeeks * weekWidth + 100} height={numLines * 40 + 200}>
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
                    x2={numWeeks * weekWidth + 50}
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
            <line x1="50" y1={130 + numLines * 40} x2={numWeeks * weekWidth + 50} y2={130 + numLines * 40} stroke="#333" strokeWidth="2" />

            {/* Lignes verticales automatiques sur les jalons (fines en pointillés) */}
            {milestones.map(milestone => {
              const relativeWeek = getMilestonePosition(milestone.date);
              if (relativeWeek < 0 || relativeWeek >= numWeeks) return null;

              const timelineY = 130 + numLines * 40;
              const x = 50 + relativeWeek * weekWidth + weekWidth / 2;

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
              const x = 50 + relativeWeek * weekWidth + weekWidth / 2;

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

              const x1 = 50 + startPos * weekWidth + weekWidth / 2;
              const x2 = 50 + endPos * weekWidth + weekWidth / 2;

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
                      cx={50 + i * weekWidth + weekWidth / 2}
                      cy={timelineY}
                      r={isMonth ? 6 : 3}
                      fill={isMonth ? '#333' : '#666'}
                    />
                    <text
                      x={50 + i * weekWidth + weekWidth / 2}
                      y={timelineY + 20}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#666"
                    >
                      S{weekNum}
                    </text>
                    {showMonth && (
                      <text
                        x={50 + i * weekWidth + weekWidth / 2}
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

              const x = 50 + relativeWeek * weekWidth + weekWidth / 2;
              const milestoneLine = Math.min(Math.max(milestone.line || 1, 1), numLines);
              const y = 130 + (numLines - milestoneLine) * 40;
              const iconInfo = getMilestoneIcon(milestone.type);

              const dateObj = new Date(milestone.date);
              const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

              return (
                <g key={milestone.id}>
                  {milestone.type === 'production' ? (
                    <polygon
                      points={`${x},${y-12} ${x+3.5},${y-3.5} ${x+12},${y-3.5} ${x+5},${y+2} ${x+7.5},${y+11} ${x},${y+6} ${x-7.5},${y+11} ${x-5},${y+2} ${x-12},${y-3.5} ${x-3.5},${y-3.5}`}
                      fill="#e74c3c"
                    />
                  ) : milestone.type === 'divers' ? (
                    <polygon
                      points={`${x},${y-12} ${x+8},${y} ${x},${y+12} ${x-8},${y}`}
                      fill="#3498db"
                    />
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
    </div>
  );
}