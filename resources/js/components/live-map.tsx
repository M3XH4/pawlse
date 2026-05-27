const pins = [
  { id: 1, type: 'shelter', x: 20, y: 30, name: 'PAWLSE Main Shelter', status: 'Active' },
  { id: 2, type: 'vet', x: 50, y: 40, name: 'Iligan Vet Care', status: 'Open' },
  { id: 3, type: 'feeding', x: 75, y: 65, name: 'Tambo Feeding Station', status: 'Feeding Now' },
  { id: 4, type: 'rescue', x: 35, y: 80, name: 'Rescue in Progress #402', status: 'Emergency' },
  { id: 5, type: 'vet', x: 85, y: 20, name: 'Central Pet Clinic', status: 'Closing Soon' }
];

export function LiveMap() {
  return (
    pins.map(pin => (
      <div key={pin.id} className={`pin ${pin.type}`} style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
        <div className="tooltip">
            <strong>{pin.name}</strong><br />
            Status: {pin.status}
        </div>
      </div>
    )) 
  );
}
