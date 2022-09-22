export const newPaths = (
  oldIndexPath: string,
  oldFullPath: string,
  path?: string,
  index?: boolean
) => {
  let indexPath = oldIndexPath;
  if (path) {
    indexPath = oldFullPath;
    if (!index) {
      indexPath += '/' + path;
    }
  }
  if (indexPath.startsWith('//')) {
    indexPath = indexPath.substring(1);
  }

  let fullPath = oldFullPath + (path ? '/' + path : '');
  if (fullPath.startsWith('//')) {
    fullPath = fullPath.substring(1);
  }
  return [indexPath, fullPath];
};
