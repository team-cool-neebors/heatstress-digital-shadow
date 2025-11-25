import sys
import itertools
import math

PERCENTILE = 0.05

def percentile(values, p):
    if not values:
        return 0.0
    vals = sorted(values)
    idx = int(math.floor(p * (len(vals) - 1)))
    return vals[idx]

def level_obj_per_object(src_path, dst_path, p=PERCENTILE):
    with open(src_path, "r", errors="ignore") as f:
        lines = f.readlines()

    # 1) Read all vertices
    vertices = []
    for line in lines:
        if line.startswith("v "):
            parts = line.strip().split()
            if len(parts) >= 4:
                x, y, z = map(float, parts[1:4])
                vertices.append([x, y, z])

    print(f"Found {len(vertices)} vertices")

    # 2) Collect vertex indices per object
    obj_to_indices = {}
    current_obj = None

    for line in lines:
        if line.startswith("o "):
            current_obj = line.strip().split(maxsplit=1)[1]
            obj_to_indices.setdefault(current_obj, set())
        elif line.startswith("f ") and current_obj is not None:
            parts = line.strip().split()[1:]
            for part in parts:
                v_idx_str = part.split('/')[0]
                if not v_idx_str:
                    continue
                try:
                    idx = int(v_idx_str)
                except ValueError:
                    continue
                obj_to_indices[current_obj].add(idx)

    print(f"Found {len(obj_to_indices)} objects with faces")

    used_vertices = set(itertools.chain.from_iterable(obj_to_indices.values()))
    print(f"Unique used vertices: {len(used_vertices)}")

    # 3) Compute baseline z0 per vertex (shared verts use smallest baseline)
    vertex_delta = {idx: 0.0 for idx in used_vertices}

    for obj_name, idxs in obj_to_indices.items():
        if not idxs:
            continue

        zs = [vertices[i - 1][2] for i in idxs]
        z0 = percentile(zs, p)  # 10th percentile instead of min

        for idx in idxs:
            if vertex_delta[idx] == 0.0:
                vertex_delta[idx] = z0
            else:
                vertex_delta[idx] = min(vertex_delta[idx], z0)

    # 4) Apply shift
    for idx, z0 in vertex_delta.items():
        v = vertices[idx - 1]
        v[2] = v[2] - z0

    # 5) Write new OBJ
    out_lines = []
    v_counter = 0
    for line in lines:
        if line.startswith("v "):
            v_counter += 1
            x, y, z = vertices[v_counter - 1]
            out_lines.append(f"v {x:.5f} {y:.5f} {z:.5f}\n")
        else:
            out_lines.append(line)

    with open(dst_path, "w") as f:
        f.writelines(out_lines)

    print(f"Leveled OBJ written to: {dst_path}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python level_3dbag_obj.py input.obj output_leveled.obj")
        sys.exit(1)

    src = sys.argv[1]
    dst = sys.argv[2]
    level_obj_per_object(src, dst)
