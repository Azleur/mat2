import { Vec2 } from '@azleur/vec2';

const zeroValues = () => [[0, 0], [0, 0]];

export class Mat2 {
    values: number[][];

    constructor(values: number[][]);
    constructor(a: number, b: number, c: number, d: number);
    constructor(a: number | number[][], b?: number, c?: number, d?: number) {
        if (a instanceof Array) {
            this.values = a;
        } else {
            this.values = [[a, b!], [c!, d!]];
        }
    }

    static get Zero() { return new Mat2(0, 0, 0, 0); }
    static get Id  () { return new Mat2(1, 0, 0, 1); }
    static get Ones() { return new Mat2(1, 1, 1, 1); }

    /** Return a transposed copy of this matrix. */
    Transpose(): Mat2 {
        const values: number[][] = zeroValues();
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                values[i][j] = this.values[j][i];
            }
        }
        return new Mat2(values);
    }

    /** Return a negative copy of this matrix (swap signs). */
    Negate(): Mat2 {
        const values: number[][] = zeroValues();
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                values[i][j] = -this.values[i][j];
            }
        }
        return new Mat2(values);
    }

    /** Returns a copy of (this + mat). */
    Add(mat: Mat2): Mat2 {
        const values: number[][] = zeroValues();
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                values[i][j] = this.values[i][j] + mat.values[i][j];
            }
        }
        return new Mat2(values);
    }

    /** Returns a copy of (this - mat). */
    Sub(mat: Mat2): Mat2 {
        return this.Add(mat.Negate());
    }

    /** Return a copy of the scalar product (this * num). */
    TimesNum(num: number): Mat2 {
        const values: number[][] = zeroValues();
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                values[i][j] = num * this.values[i][j];
            }
        }
        return new Mat2(values);
    }

    /** Return a copy of the matrix product (this * mat). */
    TimesMat(mat: Mat2): Mat2 {
        const values: number[][] = zeroValues();
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                for (let k = 0; k < 2; k++) {
                    values[i][j] += this.values[i][k] * mat.values[k][j];

                }
            }
        }
        return new Mat2(values);
    }

    /** Return a copy of the matrix * vector product (this * vec). */
    TimesVec(vec: Vec2): Vec2 {
        const values: number[] = [0, 0];
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                values[i] += this.values[i][j] * vec.values[j];
            }
        }
        return new Vec2(values);
    }

    /** Return the sum of the diagonal. */
    Trace(): number {
        let value = 0;
        for (let i = 0; i < 2; i++) {
            value += this.values[i][i];
        }
        return value;
    }

    /** Return the determinant of this matrix. */
    Determinant(): number {
        const [[a, b], [c, d]] = this.values;
        return a * d - c * b;
    }

    /** Returns the rank of this matrix. */
    Rank(): number {
        if(this.Determinant() !== 0) {
            return 2;
        }
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                if(this.values[i][j] !== 0) {
                    return 1;
                }
            }
        }
        return 0;
    }
}

/**
 * Calculate the rotation matrix for a given angle, in radians.
 *
 * @param theta Angle, in radians.
 * @returns Rotation matrix.
 */
export const RotationMatrix = (theta: number): Mat2 => {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    return new Mat2(c, -s, s, c);
};
