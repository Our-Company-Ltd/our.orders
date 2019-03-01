import { generate as generateId } from 'shortid';
import { InjectedIntl } from 'react-intl';
import { GetLegend } from './FilterOperatorHelpers';
import { IFilter, FilterOperator, FilterValue } from 'src/@types/our-orders';

export class Filter implements IFilter {
    readonly Operator?: FilterOperator;
    readonly Value?: FilterValue;
    readonly Property?: string;
    readonly Id: string;
    Children?: Filter[];

    public static Empty(): Filter {
        return new Filter({
        });
    }

    public static And(...filters: IFilter[]): Filter {
        return new Filter({
            Operator: FilterOperator.and,
            Children: filters
        });
    }

    public static Eq(property: string, value: FilterValue): Filter {
        return new Filter({
            Operator: FilterOperator.eq,
            Property: property,
            Value: value
        });
    }

    public static IsNull(property: string): Filter {
        return new Filter({
            Operator: FilterOperator.isnull,
            Property: property
        });
    }

    public static IsNotNull(property: string): Filter {
        return new Filter({
            Operator: FilterOperator.isnotnull,
            Property: property
        });
    }
    
    public static Regex(property: string, value: FilterValue): Filter {
        return new Filter({
            Operator: FilterOperator.regex,
            Property: property,
            Value: value
        });
    }

    public static Like(property: string, Value: FilterValue): Filter {
        return new Filter({
            Operator: FilterOperator.like,
            Property: property,
            Value
        });
    }

    public static Lt(property: string, Value: FilterValue): Filter {
        return new Filter({
            Operator: FilterOperator.lt,
            Property: property,
            Value
        });
    }
    public static Lte(property: string, Value: FilterValue): Filter {
        return new Filter({
            Operator: FilterOperator.lte,
            Property: property,
            Value
        });
    }

    public static Gt(property: string, Value: FilterValue): Filter {
        return new Filter({
            Operator: FilterOperator.gt,
            Property: property,
            Value
        });
    }
    public static Gte(property: string, Value: FilterValue): Filter {
        return new Filter({
            Operator: FilterOperator.gte,
            Property: property,
            Value
        });
    }

    public static Ne(property: string, value: FilterValue): Filter {
        return new Filter({
            Operator: FilterOperator.ne,
            Property: property,
            Value: value
        });
    }

    public static Or(...filters: IFilter[]): Filter {
        return new Filter({
            Operator: FilterOperator.or,
            Children: filters
        });
    }

    constructor(filter: IFilter) {
        this.Operator = filter.Operator;
        this.Value = filter.Value;
        this.Property = filter.Property;
        this.Id = filter.Id || generateId();
        if (filter.Children) {
            this.Children = filter.Children.map(c => new Filter(c));
        }

    }

    public WithProperty(property?: string): Filter {
        return new Filter({
            Children: this.Children,
            Value: this.Value,
            Property: property,
            Id: this.Id,
            Operator: this.Operator
        });
    }

    public WithValue(value?: FilterValue): Filter {
        return new Filter({
            Children: this.Children,
            Value: value,
            Property: this.Property,
            Id: this.Id,
            Operator: this.Operator
        });
    }

    public WithOperator(operator?: FilterOperator): Filter {
        return new Filter({
            Children: this.Children,
            Value: this.Value,
            Property: this.Property,
            Id: this.Id,
            Operator: operator
        });
    }

    public WithChildren(children?: Filter[]): Filter {
        return new Filter({
            Children: children,
            Value: this.Value,
            Property: this.Property,
            Id: this.Id,
            Operator: this.Operator
        });
    }

    public isValid(): boolean {

        if (this.Operator === FilterOperator.and) {
            return true;
        }
        if (this.Operator === FilterOperator.or) {
            return true;
        }
        return this.Property !== undefined && this.Value !== undefined && this.Operator !== undefined;
    }

    public toString = (intl: InjectedIntl): string => {
        const operator = this.Operator;
        if (operator === FilterOperator.and) {
            const children = this.Children;
            if (!children) { return ''; }
            return children.map(c => c.toString(intl)).join(` ${GetLegend(intl, operator)} `);
        }
        if (operator === FilterOperator.or) {
            const children = this.Children;
            if (!children) { return ''; }
            return children.map(c => c.toString(intl)).join(` ${GetLegend(intl, operator)} `);
        }

        const operatorLegend = operator ? GetLegend(intl, operator) : '';

        return `${this.Property || ''} ${operatorLegend} ${this.Value || ''}`;
    }

    public toJson = (): IFilter => {
        const result: IFilter = {
            Operator: this.Operator,
            Property: this.Property,
            Value: this.Value,
            Children: this.Children ? this.Children.map(c => c.toJson()) : undefined
        };

        return result;
    }

}