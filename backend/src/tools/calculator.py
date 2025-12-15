import math

from langchain_core.tools import tool


@tool
def calculator_tool(expression: str) -> str:
    """Calculate the result of a mathematical expression.

    This tool can handle basic arithmetic operations including:
    - Addition (+)
    - Subtraction (-)
    - Multiplication (*)
    - Division (/)
    - Exponentiation (**)
    - Parentheses for grouping
    - Basic math functions like sqrt, sin, cos, tan, log, etc.

    Args:
        expression: A mathematical expression as a string (e.g., "2 + 3 * 4", "sqrt(16)", "sin(3.14159/2)")

    Returns:
        The calculated result as a string, or an error message if the expression is invalid.

    Examples:
        - "2 + 3" returns "5"
        - "sqrt(16)" returns "4.0"
        - "2 ** 3" returns "8"
        - "sin(3.14159/2)" returns "1.0"
    """
    try:
        # Create a safe namespace with basic math operations and functions
        safe_dict = {
            "__builtins__": {},
            "abs": abs,
            "round": round,
            "pow": pow,
            "max": max,
            "min": min,
            # Math module functions
            "sqrt": math.sqrt,
            "sin": math.sin,
            "cos": math.cos,
            "tan": math.tan,
            "asin": math.asin,
            "acos": math.acos,
            "atan": math.atan,
            "log": math.log,
            "log10": math.log10,
            "exp": math.exp,
            "pi": math.pi,
            "e": math.e,
            "ceil": math.ceil,
            "floor": math.floor,
            "factorial": math.factorial,
        }

        # Evaluate the expression safely
        result = eval(expression, safe_dict)

        # Convert result to string, handling different number types
        if isinstance(result, (int, float)):
            # Format floats to remove unnecessary decimals
            if isinstance(result, float) and result.is_integer():
                return str(int(result))
            elif isinstance(result, float):
                return f"{result:.10g}"  # Use general format to avoid scientific notation for reasonable numbers
            else:
                return str(result)
        else:
            return str(result)

    except ZeroDivisionError:
        return "Error: Division by zero is not allowed."
    except ValueError as e:
        return f"Error: Invalid mathematical operation - {str(e)}"
    except NameError as e:
        return f"Error: Unknown function or variable - {str(e)}"
    except SyntaxError:
        return "Error: Invalid mathematical expression syntax."
    except Exception as e:
        return f"Error: Unable to calculate the expression - {str(e)}"
