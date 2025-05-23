const React = require('react');

module.exports = {
  MapContainer: ({ children }) => <div data-testid="mock-map">{children}</div>,
  TileLayer: () => <div data-testid="mock-tilelayer" />,
  Marker: ({ children }) => <div data-testid="mock-marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="mock-popup">{children}</div>,
  useMap: () => ({}),
  useMapEvent: () => {},
  useMapEvents: () => {},
};
