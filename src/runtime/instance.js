import { id, addonType } from "../../config.caw.js";
import AddonTypeMap from "../../template/addonTypeMap.js";

export default function (parentClass) {
  return class extends parentClass {
    constructor() {
      super();
      const properties = this._getInitProperties();
      if (properties) {
      }
    }

    _trigger(method) {
      this.dispatch(method);
      super._trigger(self.C3[AddonTypeMap[addonType]][id].Cnds[method]);
    }

    on(tag, callback, options) {
      if (!this.events[tag]) {
        this.events[tag] = [];
      }
      this.events[tag].push({ callback, options });
    }

    off(tag, callback) {
      if (this.events[tag]) {
        this.events[tag] = this.events[tag].filter(
          (event) => event.callback !== callback
        );
      }
    }

    localToWorldFromQuad(u, v, quad) {
      // Extract the top-left corner position
      const topLeftX = quad.p1.x;
      const topLeftY = quad.p1.y;

      // Compute the edge vectors
      const topEdgeX = quad.p2.x - topLeftX;
      const topEdgeY = quad.p2.y - topLeftY;
      const leftEdgeX = quad.p4.x - topLeftX;
      const leftEdgeY = quad.p4.y - topLeftY;

      // Compute interpolated position
      const x = topLeftX + topEdgeX * u + leftEdgeX * v;
      const y = topLeftY + topEdgeY * u + leftEdgeY * v;

      return [x, y];
    }

    worldToLocalFromQuad(xWorld, yWorld, quad) {
      // Extract the corner coordinates
      const tlx = quad.p1.x,
        tly = quad.p1.y;
      const trx = quad.p2.x,
        try_ = quad.p2.y;
      const blx = quad.p4.x,
        bly = quad.p4.y;

      // Compute the vectors
      const dxT = trx - tlx,
        dyT = try_ - tly;
      const dxB = blx - tlx,
        dyB = bly - tly;

      // Compute the relative position of (xWorld, yWorld)
      const dx = xWorld - tlx,
        dy = yWorld - tly;

      // Solve for (t, e) using Cramer's Rule
      const det = dxT * dyB - dyT * dxB; // Determinant of the transformation matrix

      if (Math.abs(det) < 1e-6) {
        throw new Error(
          "Degenerate quad transformation (determinant is too close to zero)."
        );
      }

      // Compute the inverse matrix components
      const t = (dx * dyB - dy * dxB) / det;
      const e = (dy * dxT - dx * dyT) / det;

      return [t, e]; // Return normalized coordinates
    }

    worldToLocalFromUID(uid, xWorld, yWorld) {
      const inst = this._runtime.getInstanceByUID(uid);
      return this.worldToLocalFromInst(inst, xWorld, yWorld);
    }

    worldToLocalFromInst(inst, xWorld, yWorld) {
      if (!inst) {
        return [0, 0];
      }
      const quad = inst.getBoundingQuad(true);
      const [t, e] = this.worldToLocalFromQuad(xWorld, yWorld, quad);

      return [t, e];
    }

    localToWorldFromUID(uid, t, e) {
      const inst = this._runtime.getInstanceByUID(uid);
      return this.localToWorldFromInst(inst, t, e);
    }

    localToWorldFromInst(inst, t, e) {
      if (!inst) {
        return [0, 0];
      }
      const quad = inst.getBoundingQuad(true);
      const [x, y] = this.localToWorldFromQuad(t, e, quad);

      return [x, y];
    }

    dispatch(tag) {
      if (this.events[tag]) {
        this.events[tag].forEach((event) => {
          if (event.options && event.options.params) {
            const fn = self.C3[AddonTypeMap[addonType]][id].Cnds[tag];
            if (fn && !fn.call(this, ...event.options.params)) {
              return;
            }
          }
          event.callback();
          if (event.options && event.options.once) {
            this.off(tag, event.callback);
          }
        });
      }
    }

    _release() {
      super._release();
    }

    _saveToJson() {
      return {
        // data to be saved for savegames
      };
    }

    _loadFromJson(o) {
      // load state for savegames
    }
  };
}
