"use client";

import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { calculatePower, calculateIntervalEnergy, findPeak } from "@/utils/math";
import { cn } from "@/lib/utils";
import { Leaf, Zap, DollarSign, Trophy, Settings2 } from "lucide-react";

// --- Components ---

const Card = ({
  title,
  value,
  subtext,
  icon: Icon,
  highlight = false,
}: {
  title: string;
  value: string;
  subtext?: string;
  icon: React.ElementType;
  highlight?: boolean;
}) => (
  <div
    className={cn(
      "p-6 rounded-xl border shadow-sm transition-all duration-300",
      highlight
        ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
        : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
    )}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {title}
      </h3>
      <div
        className={cn(
          "p-2 rounded-full",
          highlight
            ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
      {value}
    </div>
    {subtext && (
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {subtext}
      </p>
    )}
  </div>
);

const SliderControl = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}) => (
  <div className="mb-4">
    <div className="flex justify-between mb-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {value} {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-green-600"
    />
  </div>
);

const ModelControls = ({
  title,
  k,
  setK,
  a,
  setA,
  color,
}: {
  title: string;
  k: number;
  setK: (val: number) => void;
  a: number;
  setA: (val: number) => void;
  color: string;
}) => (
  <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 mb-4">
    <h3 className={`font-semibold mb-3 flex items-center gap-2 ${color}`}>
      <Settings2 className="w-4 h-4" /> {title}
    </h3>
    <SliderControl
      label="Constante k (Amplitud)"
      value={k}
      onChange={setK}
      min={10}
      max={500}
      step={10}
    />
    <SliderControl
      label="Constante a (Decaimiento)"
      value={a}
      onChange={setA}
      min={0.1}
      max={5.0}
      step={0.1}
    />
  </div>
);

// --- Main Page ---

export default function EnergySimulator() {
  // State
  const [cycleTime, setCycleTime] = useState(4); // Hours
  const [costPerKWh, setCostPerKWh] = useState(160.55); // CLP

  // Model A Defaults
  const [kA, setKA] = useState(200);
  const [aA, setAA] = useState(1.0);

  // Model B Defaults
  const [kB, setKB] = useState(80);
  const [aB, setAB] = useState(0.5);

  // Calculations
  const data = useMemo(() => {
    const points = [];
    const steps = 50;
    for (let i = 0; i <= steps; i++) {
      const t = (cycleTime * i) / steps;
      points.push({
        time: t.toFixed(2),
        powerA: calculatePower(t, kA, aA),
        powerB: calculatePower(t, kB, aB),
      });
    }
    return points;
  }, [cycleTime, kA, aA, kB, aB]);

  const results = useMemo(() => {
    const energyA = calculateIntervalEnergy(cycleTime, kA, aA); // Wh
    const energyB = calculateIntervalEnergy(cycleTime, kB, aB); // Wh

    const costA = (energyA / 1000) * costPerKWh;
    const costB = (energyB / 1000) * costPerKWh;

    const peakA = findPeak(kA, aA);
    const peakB = findPeak(kB, aB);

    const winner = costA < costB ? "A" : "B";
    const savings =
      winner === "A"
        ? ((costB - costA) / costB) * 100
        : ((costA - costB) / costA) * 100;

    return {
      energyA,
      energyB,
      costA,
      costB,
      peakA,
      peakB,
      winner,
      savings: savings.toFixed(1),
    };
  }, [cycleTime, kA, aA, kB, aB, costPerKWh]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 p-2 rounded-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
              Araucanía Data Energy
            </h1>
          </div>
          <div className="text-sm text-slate-500">
            Cálculo II - EID1
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-slate-500" /> Configuración
                Global
              </h2>
              <SliderControl
                label="Tiempo del Ciclo (Horas)"
                value={cycleTime}
                onChange={setCycleTime}
                min={1}
                max={10}
                step={0.5}
                unit="h"
              />
              <div className="mb-4">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Costo Energía ($/kWh)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    value={costPerKWh}
                    onChange={(e) => setCostPerKWh(parseFloat(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Parámetros del Modelo</h2>
              <ModelControls
                title="Modelo A (Servidor Estándar)"
                k={kA}
                setK={setKA}
                a={aA}
                setA={setAA}
                color="text-blue-600"
              />
              <ModelControls
                title="Modelo B (Servidor Eco)"
                k={kB}
                setK={setKB}
                a={aB}
                setA={setAB}
                color="text-emerald-600"
              />
            </div>
          </div>

          {/* Main Dashboard */}
          <div className="lg:col-span-8 space-y-6">
            {/* Verdict Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-lg flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  Opción Recomendada: Modelo {results.winner}
                </h2>
                <p className="text-slate-300">
                  Esta configuración es más eficiente y genera un ahorro del{" "}
                  <span className="text-green-400 font-bold">
                    {results.savings}%
                  </span>{" "}
                  en costos operativos.
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">
                Curvas de Potencia P(t) = k·t·e^(-at)
              </h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="time"
                      label={{
                        value: "Tiempo (h)",
                        position: "insideBottomRight",
                        offset: -5,
                      }}
                    />
                    <YAxis
                      label={{
                        value: "Potencia (W)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        color: "#000",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="powerA"
                      name="Modelo A"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorA)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="powerB"
                      name="Modelo B"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorB)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                title="Peak de Potencia"
                value={`${results.peakA.power.toFixed(1)} W vs ${results.peakB.power.toFixed(1)} W`}
                subtext={`Ocurre en t=${results.peakA.time.toFixed(1)}h / t=${results.peakB.time.toFixed(1)}h`}
                icon={Zap}
              />
              <Card
                title="Consumo Total"
                value={`${results.energyA.toFixed(0)} Wh vs ${results.energyB.toFixed(0)} Wh`}
                subtext="Integral bajo la curva en el intervalo [0, T]"
                icon={Leaf}
              />
              <Card
                title="Costo del Ciclo"
                value={`$${results.costA.toFixed(1)} vs $${results.costB.toFixed(1)}`}
                subtext={`Basado en $${costPerKWh}/kWh`}
                icon={DollarSign}
                highlight={true}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
