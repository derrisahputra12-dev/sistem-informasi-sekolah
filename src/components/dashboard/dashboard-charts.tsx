  'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const studentGrowthData = [
  { year: '2020', total: 450 },
  { year: '2021', total: 520 },
  { year: '2022', total: 610 },
  { year: '2023', total: 780 },
  { year: '2024', total: 850 },
]

const applicantData = [
  { year: '2020', pendaftar: 200, diterima: 150 },
  { year: '2021', pendaftar: 250, diterima: 180 },
  { year: '2022', pendaftar: 320, diterima: 210 },
  { year: '2023', pendaftar: 400, diterima: 250 },
  { year: '2024', pendaftar: 450, diterima: 280 },
]

const graduationData = [
  { year: '2020', lulus: 140 },
  { year: '2021', lulus: 165 },
  { year: '2022', lulus: 190 },
  { year: '2023', lulus: 230 },
  { year: '2024', lulus: 260 },
]

export function DashboardCharts() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Pertumbuhan Siswa */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Pertumbuhan Total Siswa</CardTitle>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Perkembangan Kumulatif</p>
        </CardHeader>
        <CardContent className="h-[300px] min-h-[300px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={studentGrowthData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#64748b'}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#64748b'}} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#2563eb" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pendaftar vs Diterima */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Pendaftar vs Diterima</CardTitle>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Statistik PPDB</p>
        </CardHeader>
        <CardContent className="h-[300px] min-h-[300px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={applicantData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#64748b'}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#64748b'}} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
              <Bar dataKey="pendaftar" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="diterima" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Grafik Kelulusan */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Grafik Kelulusan</CardTitle>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Performa Lulusan</p>
        </CardHeader>
        <CardContent className="h-[300px] min-h-[300px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graduationData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#64748b'}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#64748b'}} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="stepAfter" 
                dataKey="lulus" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
