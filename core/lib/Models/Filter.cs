using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using our.orders.Helpers;

namespace our.orders.Models
{
    [JsonObject]
    public class Filter
    {
        private Filter()
        {

        }

        [JsonProperty]
        public FilterOperator Operator { get; private set; }

        [JsonProperty]
        public object Value { get; private set; }

        [JsonProperty]
        public string Property { get; private set; }

        [JsonProperty]
        public IEnumerable<Filter> Children { get; private set; }

        public static Filter And(params Filter[] filters)
        {
            return new Filter
            {
                Operator = FilterOperator.and,
                Children = filters
            };
        }

        public static Filter Or(params Filter[] filters)
        {
            return new Filter
            {
                Operator = FilterOperator.or,
                Children = filters
            };
        }


        public static Filter Lt(string property, object value)
        {
            return new Filter
            {
                Operator = FilterOperator.lt,
                Property = property,
                Value = value
            };
        }


        public static Filter Lte(string property, object value)
        {
            return new Filter
            {
                Operator = FilterOperator.lte,
                Property = property,
                Value = value
            };
        }

        public static Filter Gt(string property, object value)
        {
            return new Filter
            {
                Operator = FilterOperator.gt,
                Property = property,
                Value = value
            };
        }


        public static Filter Gte(string property, object value)
        {
            return new Filter
            {
                Operator = FilterOperator.gte,
                Property = property,
                Value = value
            };
        }



        public static Filter Ne(string property, object value)
        {
            return new Filter
            {
                Operator = FilterOperator.ne,
                Property = property,
                Value = value
            };
        }


        public static Filter Eq(string property, object value)
        {
            return new Filter
            {
                Operator = FilterOperator.eq,
                Property = property,
                Value = value
            };
        }

        public static Filter Like(string property, object value)
        {
            return new Filter
            {
                Operator = FilterOperator.like,
                Property = property,
                Value = value
            };
        }


        public Expression<Func<T, bool>> And<T>(Expression<Func<T, bool>> expr1, Expression<Func<T, bool>> expr2)
        {
            var invokedExpr = Expression.Invoke(expr2, expr1.Parameters.Cast<Expression>());
            return Expression.Lambda<Func<T, bool>>
                  (Expression.AndAlso(expr1.Body, invokedExpr), expr1.Parameters);
        }
        internal class ReplaceVisitor : ExpressionVisitor
        {
            private readonly Expression from, to;
            public ReplaceVisitor(Expression from, Expression to)
            {
                this.from = from;
                this.to = to;
            }
            public override Expression Visit(Expression node)
            {
                return node == from ? to : base.Visit(node);
            }
        }

        public static Expression Replace(Expression expression,
            Expression searchEx, Expression replaceEx)
        {
            return new ReplaceVisitor(searchEx, replaceEx).Visit(expression);
        }
        public Expression<Func<TModel, bool>> Predicate<TModel>()
        {
            var modelType = typeof(TModel);
            var argParam = Expression.Parameter(modelType, "model");
            switch (Operator)
            {
                case FilterOperator.and:
                    {
                        var andAlso = Children
                            .Select(f => f.Predicate<TModel>())
                            .Select(func => Replace(func.Body, func.Parameters[0], argParam))
                            .Aggregate((a, b) => Expression.AndAlso(a, b));
                        return Expression.Lambda<Func<TModel, bool>>(andAlso, argParam);
                    }
                case FilterOperator.or:
                    {
                        var orElse = Children
                            .Select(f => f.Predicate<TModel>())
                            .Select(func => Replace(func.Body, func.Parameters[0], argParam))
                            .Aggregate((a, b) => Expression.OrElse(a, b));
                        return Expression.Lambda<Func<TModel, bool>>(orElse, argParam);
                    }

            }
            Expression property = null;
            if (modelType.IsInterface)
            {
                // if interface, we have to find the property in the subinterfaces
                var p = modelType.GetProperty(Property);
                if (p == null)
                {
                    foreach (var inte in modelType.GetInterfaces())
                    {
                        p = inte.GetProperty(Property);
                        if (p != null)
                        {
                            argParam = Expression.Parameter(inte, "model");
                            property = Expression.Property(argParam, Property) as Expression;
                            break;
                        }
                    }

                }
                else
                {
                    property = Expression.Property(argParam, Property) as Expression;
                }
            }
            else
            {
                property = Expression.Property(argParam, Property) as Expression;
            }


            switch (Operator)
            {
                case FilterOperator.isnull:
                    {
                        return Expression.Lambda<Func<TModel, bool>>(Expression.Equal(property, Expression.Constant(null, typeof(object))), argParam);
                    }
                case FilterOperator.isnotnull:
                    {
                        return Expression.Lambda<Func<TModel, bool>>(Expression.NotEqual(property, Expression.Constant(null, typeof(object))), argParam);
                    }
            }

            var valObj = Value;
            if (property.Type.IsEnum && Value is string)
            {

                Enum.TryParse(property.Type, Value as string, out valObj);
            }

            var value = Expression.Constant(valObj) as Expression;


            if (IsNullableType(property.Type) && !IsNullableType(value.Type))
                value = Expression.Convert(value, property.Type);
            else if (!IsNullableType(property.Type) && IsNullableType(value.Type))
                property = Expression.Convert(property, value.Type);

            switch (Operator)
            {
                case FilterOperator.like:
                    // case insensitive ?
                    return Expression.Lambda<Func<TModel, bool>>(Expression.Call(property, typeof(string).GetMethod("Contains", new[] { typeof(string) }), value), argParam);
                case FilterOperator.eq:
                    return Expression.Lambda<Func<TModel, bool>>(Expression.Equal(property, value), argParam);
                case FilterOperator.ne:
                    return Expression.Lambda<Func<TModel, bool>>(Expression.NotEqual(property, value), argParam);
                case FilterOperator.gt:
                    return Expression.Lambda<Func<TModel, bool>>(Expression.GreaterThan(property, value), argParam);
                case FilterOperator.gte:
                    return Expression.Lambda<Func<TModel, bool>>(Expression.GreaterThanOrEqual(property, value), argParam);
                case FilterOperator.lt:
                    return Expression.Lambda<Func<TModel, bool>>(Expression.LessThan(property, value), argParam);
                case FilterOperator.lte:
                    return Expression.Lambda<Func<TModel, bool>>(Expression.LessThanOrEqual(property, value), argParam);
                default:
                    throw new NotImplementedException();
            }
        }

        static bool IsNullableType(Type t)
        {
            return t.IsGenericType && t.GetGenericTypeDefinition() == typeof(Nullable<>);
        }
    }


}