import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export type EntryType = 'RECEITA' | 'DESPESA';

export interface FinancialEntryAttributes {
  id?: number;
  descricao: string;
  valor: string;
  tipo: EntryType;
  categoria: string;
  data_lancamento: string;
  user_id: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class FinancialEntry
  extends Model<FinancialEntryAttributes>
  implements FinancialEntryAttributes
{
  declare id: number;
  declare descricao: string;
  declare valor: string;
  declare tipo: EntryType;
  declare categoria: string;
  declare data_lancamento: string;
  declare user_id: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

FinancialEntry.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    descricao: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    valor: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0.01 },
    },
    tipo: {
      type: DataTypes.ENUM('RECEITA', 'DESPESA'),
      allowNull: false,
    },
    categoria: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    data_lancamento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'financial_entries',
    timestamps: true,
  },
);
