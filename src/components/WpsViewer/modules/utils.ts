/**
 * @deprecated Internal utility kept for compatibility. 兼容保留的内部工具，不推荐外部直接依赖。
 */
export const generateRandomString = (
  length: number,
  includeUpperCase: boolean = true,
  includeLowerCase: boolean = true,
): string => {
  if (length <= 0) {
    return '';
  }

  let characters = '';

  if (includeUpperCase) {
    characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }

  if (includeLowerCase) {
    characters += 'abcdefghijklmnopqrstuvwxyz';
  }

  if (!characters) {
    characters = 'abcdefghijklmnopqrstuvwxyz';
  }

  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};


