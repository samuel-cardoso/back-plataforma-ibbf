import { DomainError } from '@/shared/errors';

export type FundProps = {
  id: string | null;
  name: string;
  restricted: boolean;
  active: boolean;
  pixTxid: string | null;
  sortOrder: number;
  createdAt: Date;
};

/** txid de QR Pix estático: só letras e números, até 25 caracteres (padrão BR Code do BCB). */
const PIX_TXID_PATTERN = /^[A-Z0-9]{1,25}$/;

export class Fund {
  private constructor(private props: FundProps) {}

  static create(props: {
    name: string;
    restricted?: boolean;
    pixTxid?: string | null;
    sortOrder?: number;
    now?: Date;
  }): Fund {
    return new Fund({
      id: null,
      name: Fund.validateName(props.name),
      restricted: props.restricted ?? false,
      active: true,
      pixTxid: Fund.normalizePixTxid(props.pixTxid),
      sortOrder: props.sortOrder ?? 0,
      createdAt: props.now ?? new Date(),
    });
  }

  static restore(props: FundProps): Fund {
    if (!props.id) throw new DomainError('Fundo inválido (id ausente)', 'FUND.INVALID_STATE');
    return new Fund({ ...props });
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get restricted() { return this.props.restricted; }
  get active() { return this.props.active; }
  get pixTxid() { return this.props.pixTxid; }
  get sortOrder() { return this.props.sortOrder; }
  get createdAt() { return this.props.createdAt; }

  /**
   * `restricted` não é editável: trocar a natureza de um fundo depois de haver lançamentos
   * mudaria retroativamente o que pode ser gasto com dinheiro já recebido.
   */
  update(patch: { name?: string; active?: boolean; pixTxid?: string | null; sortOrder?: number }) {
    if (patch.name !== undefined) this.props.name = Fund.validateName(patch.name);
    if (patch.active !== undefined) this.props.active = patch.active;
    if (patch.pixTxid !== undefined) this.props.pixTxid = Fund.normalizePixTxid(patch.pixTxid);
    if (patch.sortOrder !== undefined) this.props.sortOrder = patch.sortOrder;
  }

  toJSON() {
    return {
      id: this.props.id,
      name: this.props.name,
      restricted: this.props.restricted,
      active: this.props.active,
      pixTxid: this.props.pixTxid,
      sortOrder: this.props.sortOrder,
      createdAt: this.props.createdAt.toISOString(),
    };
  }

  private static validateName(name: string): string {
    const trimmed = name?.trim();
    if (!trimmed) throw new DomainError('Nome do fundo é obrigatório', 'FUND.INVALID_NAME');
    return trimmed;
  }

  private static normalizePixTxid(txid?: string | null): string | null {
    if (!txid || !txid.trim()) return null;
    const normalized = txid.trim().toUpperCase();
    if (!PIX_TXID_PATTERN.test(normalized)) {
      throw new DomainError('Identificador Pix deve ter até 25 letras ou números', 'FUND.INVALID_PIX_TXID');
    }
    return normalized;
  }
}
