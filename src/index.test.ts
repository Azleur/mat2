import { Vec2 } from '@azleur/vec2';
import { Mat2, RotationMatrix } from '.';

const AssertEqual = (observed: Mat2, expected: Mat2): void => {
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            const obs = observed.values[i][j];
            const exp = expected.values[i][j];
            const err = Math.abs(obs - exp);
            if (err > 0.0001) {
                throw new Error(`MISMATCH [${i}, ${j}] observed: ${obs}, expected: ${exp}.`);
            }
        }
    }
};

const AssertVec = (observed: Vec2, expected: Vec2): void => {
    for (let i = 0; i < 2; i++) {
        const obs = observed.values[i];
        const exp = expected.values[i];
        const err = Math.abs(obs - exp);
        if (err > 0.0001) {
            throw new Error(`MISMATCH [${i}] observed: ${obs}, expected: ${exp}.`);
        }
    }
};

test("Mat2 constructor takes number[][] or (a, b, c, d) and creates a 2x2 matrix", () => {
    const mat1 = new Mat2([[0, 0], [0, 0]]);
    const mat2 = new Mat2([[1, 2], [3, 4]]);
    const mat3 = new Mat2(0, 0, 0, 0);
    const mat4 = new Mat2(1, 2, 3, 4);

    expect(mat1).toEqual({ values: [[0, 0], [0, 0]] });
    expect(mat2).toEqual({ values: [[1, 2], [3, 4]] });
    expect(mat3).toEqual({ values: [[0, 0], [0, 0]] });
    expect(mat4).toEqual({ values: [[1, 2], [3, 4]] });

    expect(mat1).toEqual(mat3);
    expect(mat2).toEqual(mat4);
});

test("Mat2.Transpose() returns a transposed copy", () => {
    const mat1 = Mat2.Zero;
    const mat2 = Mat2.Id;
    const mat3 = new Mat2(0, 1, 2, 3);
    const mat4 = new Mat2(0, 2, 1, 3);

    const out1 = mat1.Transpose();
    const out2 = mat2.Transpose();
    const out3 = mat3.Transpose();
    const out4 = mat4.Transpose();

    AssertEqual(out1, mat1); // Zero is transpose-invariant.
    AssertEqual(out2, mat2); // Identity is transpose-invariant.
    AssertEqual(out3, mat4); // mat3 is mapped to mat4.
    AssertEqual(out4, mat3); // mat4 is mapped to mat3 again.
});

test("Mat2.Negate() returns a copy of -this", () => {
    const mat1 = Mat2.Zero;
    const mat2 = Mat2.Id;
    const mat3 = new Mat2(0, 1, 2, 3);

    const mat4 = new Mat2(-1, 0, 0, -1);
    const mat5 = new Mat2(0, -1, -2, -3);

    const out1 = mat1.Negate();
    const out2 = mat2.Negate();
    const out3 = mat3.Negate();
    const out4 = mat4.Negate();
    const out5 = mat5.Negate();

    AssertEqual(out1, mat1); // Zero is its own negative.
    AssertEqual(out2, mat4);
    AssertEqual(out3, mat5);
    AssertEqual(out4, mat2); // Negate() is its own dual.
    AssertEqual(out5, mat3);
});

test("Mat2.Add(Mat2) adds this + that", () => {
    const mat1 = Mat2.Zero;
    const mat2 = Mat2.Ones;
    const mat3 = Mat2.Id;
    const mat4 = new Mat2(1, 2, 3, 4);

    const mat5 = new Mat2(2, 1, 1, 2);
    const mat6 = new Mat2(2, 3, 4, 5);

    // Adding Zero returns first.
    AssertEqual(mat1.Add(mat1), mat1);
    AssertEqual(mat1.Add(mat2), mat2);
    AssertEqual(mat1.Add(mat3), mat3);
    AssertEqual(mat1.Add(mat4), mat4);

    // Adding to Zero returns second.
    AssertEqual(mat1.Add(mat1), mat1);
    AssertEqual(mat2.Add(mat1), mat2);
    AssertEqual(mat3.Add(mat1), mat3);
    AssertEqual(mat4.Add(mat1), mat4);

    // Non-trivial cases and commutativity:
    AssertEqual(mat2.Add(mat3), mat5);
    AssertEqual(mat3.Add(mat2), mat5);

    AssertEqual(mat2.Add(mat4), mat6);
    AssertEqual(mat4.Add(mat2), mat6);

    // Negating subtracts, inverting the non-trivial cases:
    AssertEqual(mat5.Add(mat2.Negate()), mat3);
    AssertEqual(mat5.Add(mat3.Negate()), mat2);

    AssertEqual(mat6.Add(mat2.Negate()), mat4);
    AssertEqual(mat6.Add(mat4.Negate()), mat2);
});

test("Mat2.Sub(Mat2) subtracts this - that", () => {
    const mat1 = Mat2.Zero;
    const mat2 = Mat2.Ones;
    const mat3 = Mat2.Id;
    const mat4 = new Mat2(1, 2, 3, 4);

    const mat5 = new Mat2(0, 1, 1, 0);
    const mat6 = new Mat2(0, 1, 2, 3);

    // Subtracting from Zero returns negative.
    AssertEqual(mat1.Sub(mat1), mat1.Negate());
    AssertEqual(mat1.Sub(mat2), mat2.Negate());
    AssertEqual(mat1.Sub(mat3), mat3.Negate());
    AssertEqual(mat1.Sub(mat4), mat4.Negate());

    // Subtracting Zero returns same.
    AssertEqual(mat1.Sub(mat1), mat1);
    AssertEqual(mat2.Sub(mat1), mat2);
    AssertEqual(mat3.Sub(mat1), mat3);
    AssertEqual(mat4.Sub(mat1), mat4);

    // Non-trivial cases and anti-commutativity:
    AssertEqual(mat2.Sub(mat3), mat5);
    AssertEqual(mat3.Sub(mat2), mat5.Negate());

    AssertEqual(mat4.Sub(mat2), mat6);
    AssertEqual(mat2.Sub(mat4), mat6.Negate());
});

test("Mat2.TimesNum(number) returns the scalar product this * that", () => {
    const mat = new Mat2(1, 2, 3, 4);

    // 1 is the neutral element.
    AssertEqual(Mat2.Zero.TimesNum(1), Mat2.Zero);
    AssertEqual(Mat2.Ones.TimesNum(1), Mat2.Ones);
    AssertEqual(Mat2.Id.TimesNum(1), Mat2.Id);
    AssertEqual(mat.TimesNum(1), mat);

    // 0 maps everything to Mat2.Zero.
    AssertEqual(Mat2.Zero.TimesNum(0), Mat2.Zero);
    AssertEqual(Mat2.Ones.TimesNum(0), Mat2.Zero);
    AssertEqual(Mat2.Id.TimesNum(0), Mat2.Zero);

    // 2 duplicates!
    AssertEqual(Mat2.Zero.TimesNum(2), Mat2.Zero);
    AssertEqual(Mat2.Ones.TimesNum(2), new Mat2(2, 2, 2, 2));
    AssertEqual(Mat2.Id.TimesNum(2), new Mat2(2, 0, 0, 2));
    AssertEqual(mat.TimesNum(2), new Mat2(2, 4, 6, 8));
});

test("Mat2.TimesMat(Mat2) returns a copy of the matrix product this * that", () => {
    const mat = new Mat2(1, 2, 3, 4);

    // Mat2.Id is the left identity.
    AssertEqual(Mat2.Id.TimesMat(Mat2.Zero), Mat2.Zero);
    AssertEqual(Mat2.Id.TimesMat(Mat2.Ones), Mat2.Ones);
    AssertEqual(Mat2.Id.TimesMat(Mat2.Id  ), Mat2.Id  );
    AssertEqual(Mat2.Id.TimesMat(mat      ), mat      );

    // Mat2.Id is the right identity.
    AssertEqual(Mat2.Zero.TimesMat(Mat2.Id), Mat2.Zero);
    AssertEqual(Mat2.Ones.TimesMat(Mat2.Id), Mat2.Ones);
    AssertEqual(Mat2.Id  .TimesMat(Mat2.Id), Mat2.Id  );
    AssertEqual(mat      .TimesMat(Mat2.Id), mat      );

    // Mat2.Zero is the left zero.
    AssertEqual(Mat2.Zero.TimesMat(Mat2.Zero), Mat2.Zero);
    AssertEqual(Mat2.Zero.TimesMat(Mat2.Ones), Mat2.Zero);
    AssertEqual(Mat2.Zero.TimesMat(Mat2.Id  ), Mat2.Zero);
    AssertEqual(Mat2.Zero.TimesMat(mat      ), Mat2.Zero);

    // Mat2.Zero is the right zero.
    AssertEqual(Mat2.Zero.TimesMat(Mat2.Zero), Mat2.Zero);
    AssertEqual(Mat2.Ones.TimesMat(Mat2.Zero), Mat2.Zero);
    AssertEqual(Mat2.Id  .TimesMat(Mat2.Zero), Mat2.Zero);
    AssertEqual(mat      .TimesMat(Mat2.Zero), Mat2.Zero);

    // Real stuff
    AssertEqual(Mat2.Ones.TimesMat(Mat2.Ones), new Mat2(2, 2, 2, 2));
    AssertEqual(Mat2.Ones.TimesMat(mat), new Mat2(4, 6, 4, 6));
    AssertEqual(mat.TimesMat(Mat2.Ones), new Mat2(3, 3, 7, 7));
    AssertEqual(mat.TimesMat(mat), new Mat2(7, 10, 15, 22));
});

test("Mat2.TimesVec(Vec2) returns a copy of the matrix * vector product this * that", () => {
    const mat = new Mat2(1, 2, 3, 4);
    const vec = new Vec2(1, 2);

    // Mat2.Id is the left identity.
    AssertVec(Mat2.Id.TimesVec(Vec2.Zero), Vec2.Zero);
    AssertVec(Mat2.Id.TimesVec(Vec2.One ), Vec2.One );
    AssertVec(Mat2.Id.TimesVec(Vec2.X   ), Vec2.X   );
    AssertVec(Mat2.Id.TimesVec(Vec2.Y   ), Vec2.Y   );
    AssertVec(Mat2.Id.TimesVec(vec      ), vec      );

    // Mat2.Zero is the left zero.
    AssertVec(Mat2.Zero.TimesVec(Vec2.Zero), Vec2.Zero);
    AssertVec(Mat2.Zero.TimesVec(Vec2.One ), Vec2.Zero);
    AssertVec(Mat2.Zero.TimesVec(Vec2.X   ), Vec2.Zero);
    AssertVec(Mat2.Zero.TimesVec(Vec2.Y   ), Vec2.Zero);
    AssertVec(Mat2.Zero.TimesVec(vec      ), Vec2.Zero);

    // Vec2.Zero is the right zero.
    AssertVec(Mat2.Zero.TimesVec(Vec2.Zero), Vec2.Zero);
    AssertVec(Mat2.Ones.TimesVec(Vec2.Zero), Vec2.Zero);
    AssertVec(Mat2.Id  .TimesVec(Vec2.Zero), Vec2.Zero);
    AssertVec(mat      .TimesVec(Vec2.Zero), Vec2.Zero);

    // Real stuff.
    AssertVec(Mat2.Ones.TimesVec(Vec2.One), new Vec2(2,  2));
    AssertVec(Mat2.Ones.TimesVec(vec     ), new Vec2(3,  3));
    AssertVec(mat      .TimesVec(Vec2.One), new Vec2(3,  7));
    AssertVec(mat      .TimesVec(vec     ), new Vec2(5, 11));
});

test("Mat2.Trace() returns the sum of the diagonal", () => {
    const mat1 = new Mat2(1, 2, 3, 4);
    const mat2 = new Mat2(1, 0, 0, -1);

    expect(Mat2.Zero.Trace()).toBeCloseTo(0);
    expect(Mat2.Ones.Trace()).toBeCloseTo(2);
    expect(Mat2.Id  .Trace()).toBeCloseTo(2);
    expect(mat1     .Trace()).toBeCloseTo(5);
    expect(mat2     .Trace()).toBeCloseTo(0);
});

test("Mat2.Determinant() returns the determinant", () => {
    const mat1 = new Mat2(1, 2, 3, 4);
    const mat2 = new Mat2(1, 0, 0, -1);

    expect(Mat2.Zero.Determinant()).toBeCloseTo( 0);
    expect(Mat2.Ones.Determinant()).toBeCloseTo( 0);
    expect(Mat2.Id  .Determinant()).toBeCloseTo( 1);
    expect(mat1     .Determinant()).toBeCloseTo(-2);
    expect(mat2     .Determinant()).toBeCloseTo(-1);
});

test("Mat2.Rank() returns the rank", () => {
    const mat1 = new Mat2(1, 2, 3, 4);
    const mat2 = new Mat2(1, 0, 0, -1);
    const mat3 = new Mat2(0, 5, 0, 0);

    expect(Mat2.Zero.Rank()).toBeCloseTo(0);
    expect(Mat2.Ones.Rank()).toBeCloseTo(1);
    expect(Mat2.Id  .Rank()).toBeCloseTo(2);
    expect(mat1     .Rank()).toBeCloseTo(2);
    expect(mat2     .Rank()).toBeCloseTo(2);
    expect(mat3     .Rank()).toBeCloseTo(1);
});

test("RotationMatrix(number) returns the (ccw) rotation matrix for an angle, in radians", () => {
    const Pi = Math.PI;

    const r0   = RotationMatrix(0.0 * Pi);
    const r90  = RotationMatrix(0.5 * Pi);
    const r180 = RotationMatrix(1.0 * Pi);
    const r270 = RotationMatrix(1.5 * Pi);
    const r30  = RotationMatrix(Pi / 6);

    AssertVec(r0.TimesVec(Vec2.Right), Vec2.Right);
    AssertVec(r0.TimesVec(Vec2.Up   ), Vec2.Up   );

    AssertVec(r90.TimesVec(Vec2.Right), Vec2.Up  );
    AssertVec(r90.TimesVec(Vec2.Up   ), Vec2.Left);

    AssertVec(r180.TimesVec(Vec2.Right), Vec2.Left);
    AssertVec(r180.TimesVec(Vec2.Up   ), Vec2.Down);

    AssertVec(r270.TimesVec(Vec2.Right), Vec2.Down );
    AssertVec(r270.TimesVec(Vec2.Up   ), Vec2.Right);

    AssertVec(r30.TimesVec(Vec2.Right), new Vec2(Math.sqrt(3) / 2,            1 / 2));
    AssertVec(r30.TimesVec(Vec2.Up   ), new Vec2(         - 1 / 2, Math.sqrt(3) / 2));
});
