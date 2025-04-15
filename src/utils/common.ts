export const buildTree = data => {
  const map = new Map();
  const roots = [];

  // 遍历所有节点，存储并初始化children
  data.forEach(node => {
    node.children = [];
    map.set(node.id, node);
    if (node.level === 1) {
      roots.push(node);
    }
  });

  // 将子节点添加到父节点的children中
  data.forEach(node => {
    if (node.level === 2 && node.parentId !== null) {
      const parent = map.get(node.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  return roots;
};
