import { Request, Response } from 'express';
import { FinancialEntry, EntryType } from '../models/FinancialEntry';

const entryTypes: EntryType[] = ['RECEITA', 'DESPESA'];

function getAuthenticatedUserId(req: Request): number | null {
  return req.user?.id && Number.isInteger(req.user.id) ? req.user.id : null;
}

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateEntry(body: Record<string, unknown>): string | null {
  if (
    typeof body.descricao !== 'string' ||
    body.descricao.trim().length < 2 ||
    body.descricao.trim().length > 200
  ) {
    return 'A descrição deve conter entre 2 e 200 caracteres.';
  }

  const value = Number(body.valor);
  if (!Number.isFinite(value) || value <= 0) {
    return 'O valor deve ser um número maior que zero.';
  }

  if (
    typeof body.tipo !== 'string' ||
    !entryTypes.includes(body.tipo as EntryType)
  ) {
    return 'O tipo deve ser RECEITA ou DESPESA.';
  }

  if (typeof body.categoria !== 'string' || body.categoria.trim() === '') {
    return 'A categoria é obrigatória.';
  }

  const dateMatch =
    typeof body.data_lancamento === 'string'
      ? body.data_lancamento.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      : null;
  const validDate = dateMatch
    ? new Date(
        Number(dateMatch[1]),
        Number(dateMatch[2]) - 1,
        Number(dateMatch[3]),
      )
    : null;

  if (
    !dateMatch ||
    !validDate ||
    validDate.getFullYear() !== Number(dateMatch[1]) ||
    validDate.getMonth() !== Number(dateMatch[2]) - 1 ||
    validDate.getDate() !== Number(dateMatch[3])
  ) {
    return 'A data do lançamento deve estar no formato AAAA-MM-DD.';
  }

  return null;
}

export class FinancialEntryController {
  public static async index(req: Request, res: Response): Promise<Response> {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId)
        return res.status(401).json({ erro: 'Usuário não autenticado.' });

      const entries = await FinancialEntry.findAll({
        where: { user_id: userId },
        order: [
          ['data_lancamento', 'DESC'],
          ['id', 'DESC'],
        ],
      });
      return res.status(200).json(entries);
    } catch {
      return res.status(500).json({ erro: 'Erro ao listar lançamentos.' });
    }
  }

  public static async show(req: Request, res: Response): Promise<Response> {
    try {
      const userId = getAuthenticatedUserId(req);
      const id = parseId(String(req.params.id));
      if (!userId)
        return res.status(401).json({ erro: 'Usuário não autenticado.' });
      if (!id)
        return res
          .status(400)
          .json({ erro: 'O ID informado deve ser válido.' });

      const entry = await FinancialEntry.findOne({
        where: { id, user_id: userId },
      });
      return entry
        ? res.status(200).json(entry)
        : res.status(404).json({ erro: 'Lançamento não encontrado.' });
    } catch {
      return res.status(500).json({ erro: 'Erro ao buscar lançamento.' });
    }
  }

  public static async create(req: Request, res: Response): Promise<Response> {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId)
        return res.status(401).json({ erro: 'Usuário não autenticado.' });

      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))
        return res
          .status(400)
          .json({ erro: 'O corpo da requisição deve ser um objeto JSON.' });

      const validationError = validateEntry(
        req.body as Record<string, unknown>,
      );
      if (validationError)
        return res.status(400).json({ erro: validationError });

      const entry = await FinancialEntry.create({
        descricao: req.body.descricao.trim(),
        valor: Number(req.body.valor).toFixed(2),
        tipo: req.body.tipo,
        categoria: req.body.categoria.trim(),
        data_lancamento: req.body.data_lancamento,
        user_id: userId,
      });
      return res.status(201).json(entry);
    } catch {
      return res.status(500).json({ erro: 'Erro ao criar lançamento.' });
    }
  }

  public static async update(req: Request, res: Response): Promise<Response> {
    try {
      const userId = getAuthenticatedUserId(req);
      const id = parseId(String(req.params.id));
      if (!userId)
        return res.status(401).json({ erro: 'Usuário não autenticado.' });
      if (!id)
        return res
          .status(400)
          .json({ erro: 'O ID informado deve ser válido.' });

      const entry = await FinancialEntry.findOne({
        where: { id, user_id: userId },
      });
      if (!entry)
        return res.status(404).json({ erro: 'Lançamento não encontrado.' });

      const payload = { ...entry.toJSON(), ...req.body } as Record<
        string,
        unknown
      >;
      const validationError = validateEntry(payload);
      if (validationError)
        return res.status(400).json({ erro: validationError });

      await entry.update({
        descricao: String(payload.descricao).trim(),
        valor: Number(payload.valor).toFixed(2),
        tipo: payload.tipo as EntryType,
        categoria: String(payload.categoria).trim(),
        data_lancamento: String(payload.data_lancamento),
      });
      return res.status(200).json(entry);
    } catch {
      return res.status(500).json({ erro: 'Erro ao atualizar lançamento.' });
    }
  }

  public static async delete(req: Request, res: Response): Promise<Response> {
    try {
      const userId = getAuthenticatedUserId(req);
      const id = parseId(String(req.params.id));
      if (!userId)
        return res.status(401).json({ erro: 'Usuário não autenticado.' });
      if (!id)
        return res
          .status(400)
          .json({ erro: 'O ID informado deve ser válido.' });

      const deleted = await FinancialEntry.destroy({
        where: { id, user_id: userId },
      });
      return deleted
        ? res.status(204).send()
        : res.status(404).json({ erro: 'Lançamento não encontrado.' });
    } catch {
      return res.status(500).json({ erro: 'Erro ao excluir lançamento.' });
    }
  }
}
