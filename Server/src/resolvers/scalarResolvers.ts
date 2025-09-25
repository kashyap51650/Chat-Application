import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";

export const DateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value: any) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    throw new Error("Value is not an instance of Date: " + value);
  },
  parseValue(value: any) {
    if (typeof value === "string") {
      return new Date(value);
    }
    throw new Error("Value is not a valid date string: " + value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    throw new Error("Can only parse strings to dates but got a: " + ast.kind);
  },
});
