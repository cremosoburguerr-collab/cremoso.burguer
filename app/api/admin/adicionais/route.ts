import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/pgDb'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const categoriaSlug = searchParams.get('categoria_slug')

  try {
    let result
    if (categoriaSlug && categoriaSlug !== '__check__') {
      result = await pool.query(
        `SELECT id, categoria_slug, nome, preco, ativo, ordem, created_at
         FROM adicionais_categoria
         WHERE categoria_slug = $1
         ORDER BY ordem ASC, nome ASC`,
        [categoriaSlug]
      )
    } else {
      result = await pool.query(
        `SELECT id, categoria_slug, nome, preco, ativo, ordem, created_at
         FROM adicionais_categoria
         ORDER BY categoria_slug ASC, ordem ASC, nome ASC`
      )
    }

    const adicionais = result.rows.map((row) => ({
      id: row.id,
      categoriaSlug: row.categoria_slug,
      nome: row.nome,
      preco: Number(row.preco) || 0,
      ativo: !!row.ativo,
      ordem: row.ordem ?? 0,
      createdAt: row.created_at,
    }))

    return NextResponse.json({ adicionais })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const nome = String(body?.nome || '').trim()
  const categoriaSlug = String(body?.categoria_slug || '').trim()
  const preco = parseFloat(body?.preco) || 0
  const ativo = body?.ativo !== false
  const ordem = parseInt(body?.ordem) || 0

  if (!nome) return NextResponse.json({ error: 'nome é obrigatório' }, { status: 400 })
  if (!categoriaSlug) return NextResponse.json({ error: 'categoria_slug é obrigatório' }, { status: 400 })

  try {
    const result = await pool.query(
      `INSERT INTO adicionais_categoria (categoria_slug, nome, preco, ativo, ordem)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, categoria_slug, nome, preco, ativo, ordem, created_at`,
      [categoriaSlug, nome, preco, ativo, ordem]
    )

    const row = result.rows[0]
    return NextResponse.json({
      adicional: {
        id: row.id,
        categoriaSlug: row.categoria_slug,
        nome: row.nome,
        preco: Number(row.preco) || 0,
        ativo: !!row.ativo,
        ordem: row.ordem ?? 0,
        createdAt: row.created_at,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
