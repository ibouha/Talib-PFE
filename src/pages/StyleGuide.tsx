import React from 'react';

const COLORS = [
  { name: 'Primary', className: 'bg-primary-600', hex: '#6366f1' },
  { name: 'Accent', className: 'bg-accent-600', hex: '#f59e42' },
  { name: 'Secondary', className: 'bg-gray-900', hex: '#a78bfa' },
  { name: 'Success', className: 'bg-success-600', hex: '#22c55e' },
  { name: 'Warning', className: 'bg-yellow-400', hex: '#facc15' },
  { name: 'Error', className: 'bg-red-600', hex: '#ef4444' },
  { name: 'Gray', className: 'bg-gray-200', hex: '#f3f4f6' },
];

const StyleGuide = () => (
  <div className="max-w-3xl mx-auto py-10 px-4">
    <h1 className="text-3xl font-bold mb-8">🎨 Project Style Guide</h1>

    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-4">Color Palette</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {COLORS.map((color) => (
          <div key={color.name} className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-lg shadow ${color.className}`}></div>
            <span className="mt-2 font-medium">{color.name}</span>
            <span className="text-xs text-gray-500">{color.hex}</span>
          </div>
        ))}
      </div>
    </section>

    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-4">Typography</h2>
      <div className="space-y-2">
        <div>
          <span className="text-2xl font-bold">Heading 1 - text-2xl font-bold</span>
        </div>
        <div>
          <span className="text-xl font-semibold">Heading 2 - text-xl font-semibold</span>
        </div>
        <div>
          <span className="text-base text-gray-700">Body - text-base text-gray-700</span>
        </div>
        <div>
          <span className="text-sm text-gray-500">Small - text-sm text-gray-500</span>
        </div>
        <div>
          <span className="text-xs text-gray-400">Extra Small - text-xs text-gray-400</span>
        </div>
      </div>
    </section>

    <section>
      <h2 className="text-xl font-semibold mb-4">Sample UI Elements</h2>
      <div className="flex flex-wrap gap-4 items-center">
        <button className="bg-primary-600 text-white rounded-lg px-4 py-2 hover:bg-primary-700">Primary Button</button>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Badge</span>
        <div className="bg-white rounded-lg shadow-sm p-4 border w-40">Card Example</div>
      </div>
    </section>
  </div>
);

export default StyleGuide;