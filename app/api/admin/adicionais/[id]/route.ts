import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/pgDb'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const body = await req.json()

  const setClauses: string[] = []
  const values: unknown[] = []
  let idx = 1

  if (body.nome !== undefined) {
    setClauses.push(`nome = $${idx++}`)
    values.push(String(body.nome).trim())
  }
  if (body.preco !== undefined) {
    setClauses.push(`preco = $${idx++}`)
    values.push(parseFloat(body.preco) || 0)
  }
  if (body.ativo !== undefined) {
    setClauses.push(`ativo = $${idx++}`)
    values.push(!!body.ativo)
  }
  if (body.ordem !== undefined) {
    setClauses.push(`ordem = $${idx++}`)
    values.push(parseInt(body.ordem) || 0)
  }
  if (body.categoria_slug !== undefined) {
    setClauses.push(`categoria_slug = $${idx++}`)
    values.push(String(body.categoria_slug).trim())
  }

  if (setClauses.length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
  }

  values.push(id)

  try {
    const result = await pool.query(
      `UPDATE adicionais_categoria
       SET ${setClauses.join(', ')}
       WHERE id = $${idx}
       RETURNING id, categoria_slug, nome, preco, ativo, ordem, created_at`,
      values
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Adicional não encontrado' }, { status: 404 })
    }

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

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params

  try {
    const result = await pool.query(
      `DELETE FROM adicionais_categoria WHERE id = $1`,
      [id]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Adicional não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
