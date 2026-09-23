// Iconos por tipo de vehiculo (Material Symbols) + color de acento por categoria.
// Se usa en la landing, el portal de flota y el panel admin para que cada
// auto en renta muestre un icono reconocible segun su categoria.
const DGS_VEHICLE_TYPES = {
  Sedan: { icon: 'directions_car', color: 'var(--blue)' },
  SUV: { icon: 'terrain', color: 'var(--gold)' },
  Deportivo: { icon: 'sports_motorsports', color: 'var(--red)' },
  Van: { icon: 'airport_shuttle', color: 'var(--success)' },
};

function dgsVehicleType(category) {
  return DGS_VEHICLE_TYPES[category] || { icon: 'directions_car', color: 'var(--blue)' };
}

// Icono inline para usar junto al texto de categoria (car-meta, tablas, etc.)
function dgsVehicleIconInline(category) {
  const t = dgsVehicleType(category);
  return `<span class="material-symbols-rounded veh-icon-inline" style="color:${t.color}" aria-hidden="true">${t.icon}</span>`;
}

// Insignia circular con el icono del tipo de vehiculo para la esquina de la tarjeta.
function dgsVehicleBadge(category) {
  const t = dgsVehicleType(category);
  return `<span class="car-type-badge" style="background:${t.color}" title="${category}"><span class="material-symbols-rounded" aria-hidden="true">${t.icon}</span></span>`;
}
