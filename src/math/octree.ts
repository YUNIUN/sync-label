import { T_IDType } from '@/types/renderEngine/renderEngine';

import { T_Bounding, T_BoxBounding, T_Octree, T_SphereBounding } from '../types/common';
import { Line3 } from './line3';
import { Vector3 } from './vector3';

export class Octree {
  public static isIntersected(line: Line3, center: Vector3, radius: number): boolean {
    return line.distanceToPoint(center) <= radius;
  }

  public static getRaycastLeaves(
    tree: T_Octree,
    bounding: T_Bounding,
    depth: number = 8,
    step: number = 16384,
  ) {
    const result: Array<{ value: Set<T_IDType> }> = [];
    const _getRaycastLeaves = (bounding: T_Bounding, parent: T_Octree, level: number): void => {
      if (level === depth) {
        if (!parent?.value) {
          parent.value = new Set();
        }
        result.push(parent as { value: Set<T_IDType> });
        return;
      }
      const divisor = step / 2 ** level;
      if ((bounding as unknown as { isSphereBounding?: boolean }).isSphereBounding) {
        const { radius, center } = bounding as T_SphereBounding;
        bounding = {
          isBoxBounding: true,
          min: {
            x: center.x - radius,
            y: center.y - radius,
            z: center.z - radius,
          },
          max: {
            x: center.x + radius,
            y: center.y + radius,
            z: center.z + radius,
          },
        };
      }
      bounding = bounding as T_BoxBounding;
      const xMinLevel = Math.floor(bounding.min.x / divisor);
      const yMinLevel = Math.floor(bounding.min.y / divisor);
      const zMinLevel = Math.floor(bounding.min.z / divisor);
      const xMaxLevel = Math.floor(bounding.max.x / divisor);
      const yMaxLevel = Math.floor(bounding.max.y / divisor);
      const zMaxLevel = Math.floor(bounding.max.z / divisor);

      for (let x = xMinLevel; x <= xMaxLevel; ++x) {
        for (let y = yMinLevel; y <= yMaxLevel; ++y) {
          for (let z = zMinLevel; z <= zMaxLevel; ++z) {
            if (parent[`${x},${y},${z}`] === void 0) {
              parent[`${x},${y},${z}`] = {};
            }
            const min = {
              x: Math.max(x * divisor + 0.1, bounding.min.x) - x * divisor,
              y: Math.max(y * divisor + 0.1, bounding.min.y) - y * divisor,
              z: Math.max(z * divisor + 0.1, bounding.min.z) - z * divisor,
            };
            const max = {
              x: Math.min((x + 1) * divisor - 0.1, bounding.max.x) - x * divisor,
              y: Math.min((y + 1) * divisor - 0.1, bounding.max.y) - y * divisor,
              z: Math.min((z + 1) * divisor - 0.1, bounding.max.z) - z * divisor,
            };
            const childBounding: T_BoxBounding = {
              isBoxBounding: true,
              min: { x: min.x, y: min.y, z: min.z },
              max: { x: max.x, y: max.y, z: max.z },
            };
            _getRaycastLeaves(childBounding, parent[`${x},${y},${z}`], level + 1);
          }
        }
      }
    };
    _getRaycastLeaves(bounding, tree, 0);
    return result;
  }

  public static insertData(
    tree: T_Octree,
    map: Map<string, Set<{ value: Set<T_IDType> }>>,
    id: T_IDType,
    bounding: T_Bounding,
    depth: number = 8,
    step: number = 16384,
  ) {
    const objs = Octree.getRaycastLeaves(tree, bounding, depth, step);
    for (const obj of objs) {
      obj.value.add(id);
    }
    map.set(id, new Set(objs));
  }

  public static getIntersectedIds(
    tree: T_Octree,
    start: Vector3,
    end: Vector3,
    depth: number = 8,
    step: number = 16384,
  ): Array<T_IDType> {
    const ids: Set<T_IDType> = new Set();
    const line3d = new Line3(start, end);
    const _getIntersectedIds = (parent: T_Octree, level: number, origin: Vector3): void => {
      if (level === depth) {
        parent.value.forEach((id: T_IDType) => {
          ids.add(id);
        });
        return;
      }
      const divisor = step / 2 ** level;
      for (let x = 0; x < 2; ++x) {
        for (let y = 0; y < 2; ++y) {
          for (let z = 0; z < 2; ++z) {
            if (parent[`${x},${y},${z}`] === void 0) {
              continue;
            }
            const min = new Vector3(
              origin.x + x * divisor,
              origin.y + y * divisor,
              origin.z + z * divisor,
            );
            const center = new Vector3(
              min.x + divisor * 0.5,
              min.y + divisor * 0.5,
              min.z + divisor * 0.5,
            );
            if (Octree.isIntersected(line3d, center, divisor * 0.866026)) {
              _getIntersectedIds(parent[`${x},${y},${z}`], level + 1, min);
            }
          }
        }
      }
    };

    const xmin = Math.min(start.x, end.x);
    const xmax = start.x + end.x - xmin;
    const ymin = Math.min(start.y, end.y);
    const ymax = start.y + end.y - ymin;
    const zmin = Math.min(start.z, end.z);
    const zmax = start.z + end.z - zmin;
    const xMinLevel = Math.floor(xmin / step);
    const yMinLevel = Math.floor(ymin / step);
    const zMinLevel = Math.floor(zmin / step);
    const xMaxLevel = Math.floor(xmax / step);
    const yMaxLevel = Math.floor(ymax / step);
    const zMaxLevel = Math.floor(zmax / step);
    for (let x = xMinLevel; x <= xMaxLevel; ++x) {
      for (let y = yMinLevel; y <= yMaxLevel; ++y) {
        for (let z = zMinLevel; z <= zMaxLevel; ++z) {
          if (tree[`${x},${y},${z}`] === void 0) {
            continue;
          }
          const min = { x: x * step, y: y * step, z: z * step };
          const center = new Vector3(min.x + step * 0.5, min.y + step * 0.5, min.z + step * 0.5);
          // 判断包围盒是否相交
          if (Octree.isIntersected(line3d, center, step * 0.866026)) {
            _getIntersectedIds(
              tree[`${x},${y},${z}`],
              1,
              new Vector3(x * step, y * step, z * step),
            );
          }
        }
      }
    }
    return Array.from(ids);
  }
}
