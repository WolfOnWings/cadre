// Intentionally bad fixture — exercised by .github/workflows/ci-self-test.yml.
// Each violation below is targeted at a specific check. Production CI scopes
// exclude this directory (see .oxlintrc.json ignorePatterns and check-comment-ratio
// EXCLUDE_PREFIXES) so this file does not break the normal lint surface.

// TODO: this triggers check:todos
// FIXME: also triggers check:todos

let foo: any = 1;
const X = 42;
const Y = 1337;

function notImplementedYet(): never {
  throw new Error("not implemented");
}

function deeplyNested(n: number): number {
  if (n > 0) {
    if (n > 1) {
      if (n > 2) {
        if (n > 3) {
          if (n > 4) {
            return n;
          }
        }
      }
    }
  }
  return 0;
}

const a = X == Y ? "equal" : "not";

try {
  notImplementedYet();
} catch {}

let unused = foo + X + Y;

function pad1() { return 1; }
function pad2() { return 2; }
function pad3() { return 3; }
function pad4() { return 4; }
function pad5() { return 5; }
function pad6() { return 6; }
function pad7() { return 7; }
function pad8() { return 8; }
function pad9() { return 9; }
function pad10() { return 10; }
function pad11() { return 11; }
function pad12() { return 12; }
function pad13() { return 13; }
function pad14() { return 14; }
function pad15() { return 15; }
function pad16() { return 16; }
function pad17() { return 17; }
function pad18() { return 18; }
function pad19() { return 19; }
function pad20() { return 20; }
function pad21() { return 21; }
function pad22() { return 22; }
function pad23() { return 23; }
function pad24() { return 24; }
function pad25() { return 25; }
function pad26() { return 26; }
function pad27() { return 27; }
function pad28() { return 28; }
function pad29() { return 29; }
function pad30() { return 30; }
function pad31() { return 31; }
function pad32() { return 32; }
function pad33() { return 33; }
function pad34() { return 34; }
function pad35() { return 35; }
function pad36() { return 36; }
function pad37() { return 37; }
function pad38() { return 38; }
function pad39() { return 39; }
function pad40() { return 40; }
function pad41() { return 41; }
function pad42() { return 42; }
function pad43() { return 43; }
function pad44() { return 44; }
function pad45() { return 45; }
function pad46() { return 46; }
function pad47() { return 47; }
function pad48() { return 48; }
function pad49() { return 49; }
function pad50() { return 50; }
function pad51() { return 51; }
function pad52() { return 52; }
function pad53() { return 53; }
function pad54() { return 54; }
function pad55() { return 55; }
function pad56() { return 56; }
function pad57() { return 57; }
function pad58() { return 58; }
function pad59() { return 59; }
function pad60() { return 60; }
function pad61() { return 61; }
function pad62() { return 62; }
function pad63() { return 63; }
function pad64() { return 64; }
function pad65() { return 65; }
function pad66() { return 66; }
function pad67() { return 67; }
function pad68() { return 68; }
function pad69() { return 69; }
function pad70() { return 70; }
function pad71() { return 71; }
function pad72() { return 72; }
function pad73() { return 73; }
function pad74() { return 74; }
function pad75() { return 75; }
function pad76() { return 76; }
function pad77() { return 77; }
function pad78() { return 78; }
function pad79() { return 79; }
function pad80() { return 80; }
function pad81() { return 81; }
function pad82() { return 82; }
function pad83() { return 83; }
function pad84() { return 84; }
function pad85() { return 85; }
function pad86() { return 86; }
function pad87() { return 87; }
function pad88() { return 88; }
function pad89() { return 89; }
function pad90() { return 90; }
function pad91() { return 91; }
function pad92() { return 92; }
function pad93() { return 93; }
function pad94() { return 94; }
function pad95() { return 95; }
function pad96() { return 96; }
function pad97() { return 97; }
function pad98() { return 98; }
function pad99() { return 99; }
function pad100() { return 100; }
function pad101() { return 101; }
function pad102() { return 102; }
function pad103() { return 103; }
function pad104() { return 104; }
function pad105() { return 105; }
function pad106() { return 106; }
function pad107() { return 107; }
function pad108() { return 108; }
function pad109() { return 109; }
function pad110() { return 110; }
function pad111() { return 111; }
function pad112() { return 112; }
function pad113() { return 113; }
function pad114() { return 114; }
function pad115() { return 115; }
function pad116() { return 116; }
function pad117() { return 117; }
function pad118() { return 118; }
function pad119() { return 119; }
function pad120() { return 120; }
function pad121() { return 121; }
function pad122() { return 122; }
function pad123() { return 123; }
function pad124() { return 124; }
function pad125() { return 125; }
function pad126() { return 126; }
function pad127() { return 127; }
function pad128() { return 128; }
function pad129() { return 129; }
function pad130() { return 130; }
function pad131() { return 131; }
function pad132() { return 132; }
function pad133() { return 133; }
function pad134() { return 134; }
function pad135() { return 135; }
function pad136() { return 136; }
function pad137() { return 137; }
function pad138() { return 138; }
function pad139() { return 139; }
function pad140() { return 140; }
function pad141() { return 141; }
function pad142() { return 142; }
function pad143() { return 143; }
function pad144() { return 144; }
function pad145() { return 145; }
function pad146() { return 146; }
function pad147() { return 147; }
function pad148() { return 148; }
function pad149() { return 149; }
function pad150() { return 150; }
function pad151() { return 151; }
function pad152() { return 152; }
function pad153() { return 153; }
function pad154() { return 154; }
function pad155() { return 155; }
function pad156() { return 156; }
function pad157() { return 157; }
function pad158() { return 158; }
function pad159() { return 159; }
function pad160() { return 160; }
function pad161() { return 161; }
function pad162() { return 162; }
function pad163() { return 163; }
function pad164() { return 164; }
function pad165() { return 165; }
function pad166() { return 166; }
function pad167() { return 167; }
function pad168() { return 168; }
function pad169() { return 169; }
function pad170() { return 170; }
function pad171() { return 171; }
function pad172() { return 172; }
function pad173() { return 173; }
function pad174() { return 174; }
function pad175() { return 175; }
function pad176() { return 176; }
function pad177() { return 177; }
function pad178() { return 178; }
function pad179() { return 179; }
function pad180() { return 180; }
function pad181() { return 181; }
function pad182() { return 182; }
function pad183() { return 183; }
function pad184() { return 184; }
function pad185() { return 185; }
function pad186() { return 186; }
function pad187() { return 187; }
function pad188() { return 188; }
function pad189() { return 189; }
function pad190() { return 190; }
function pad191() { return 191; }
function pad192() { return 192; }
function pad193() { return 193; }
function pad194() { return 194; }
function pad195() { return 195; }
function pad196() { return 196; }
function pad197() { return 197; }
function pad198() { return 198; }
function pad199() { return 199; }
function pad200() { return 200; }
function pad201() { return 201; }
function pad202() { return 202; }
function pad203() { return 203; }
function pad204() { return 204; }
function pad205() { return 205; }
function pad206() { return 206; }
function pad207() { return 207; }
function pad208() { return 208; }
function pad209() { return 209; }
function pad210() { return 210; }
function pad211() { return 211; }
function pad212() { return 212; }
function pad213() { return 213; }
function pad214() { return 214; }
function pad215() { return 215; }
function pad216() { return 216; }
function pad217() { return 217; }
function pad218() { return 218; }
function pad219() { return 219; }
function pad220() { return 220; }
function pad221() { return 221; }
function pad222() { return 222; }
function pad223() { return 223; }
function pad224() { return 224; }
function pad225() { return 225; }
function pad226() { return 226; }
function pad227() { return 227; }
function pad228() { return 228; }
function pad229() { return 229; }
function pad230() { return 230; }
function pad231() { return 231; }
function pad232() { return 232; }
function pad233() { return 233; }
function pad234() { return 234; }
function pad235() { return 235; }
function pad236() { return 236; }
function pad237() { return 237; }
function pad238() { return 238; }
function pad239() { return 239; }
function pad240() { return 240; }
function pad241() { return 241; }
function pad242() { return 242; }
function pad243() { return 243; }
function pad244() { return 244; }
function pad245() { return 245; }
function pad246() { return 246; }
function pad247() { return 247; }
function pad248() { return 248; }
function pad249() { return 249; }
function pad250() { return 250; }
function pad251() { return 251; }
function pad252() { return 252; }
function pad253() { return 253; }
function pad254() { return 254; }
function pad255() { return 255; }
function pad256() { return 256; }
function pad257() { return 257; }
function pad258() { return 258; }
function pad259() { return 259; }
function pad260() { return 260; }
function pad261() { return 261; }
function pad262() { return 262; }
function pad263() { return 263; }
function pad264() { return 264; }
function pad265() { return 265; }
function pad266() { return 266; }
function pad267() { return 267; }
function pad268() { return 268; }
function pad269() { return 269; }
function pad270() { return 270; }
function pad271() { return 271; }
function pad272() { return 272; }
function pad273() { return 273; }
function pad274() { return 274; }
function pad275() { return 275; }
function pad276() { return 276; }
function pad277() { return 277; }
function pad278() { return 278; }
function pad279() { return 279; }
function pad280() { return 280; }
function pad281() { return 281; }
function pad282() { return 282; }
function pad283() { return 283; }
function pad284() { return 284; }
function pad285() { return 285; }
function pad286() { return 286; }
function pad287() { return 287; }
function pad288() { return 288; }
function pad289() { return 289; }
function pad290() { return 290; }
function pad291() { return 291; }
function pad292() { return 292; }
function pad293() { return 293; }
function pad294() { return 294; }
function pad295() { return 295; }
function pad296() { return 296; }
function pad297() { return 297; }
function pad298() { return 298; }
function pad299() { return 299; }
function pad300() { return 300; }
function pad301() { return 301; }
function pad302() { return 302; }
function pad303() { return 303; }
function pad304() { return 304; }
function pad305() { return 305; }
function pad306() { return 306; }
function pad307() { return 307; }
function pad308() { return 308; }
function pad309() { return 309; }
function pad310() { return 310; }
function pad311() { return 311; }
function pad312() { return 312; }
function pad313() { return 313; }
function pad314() { return 314; }
function pad315() { return 315; }
function pad316() { return 316; }
function pad317() { return 317; }
function pad318() { return 318; }
function pad319() { return 319; }
function pad320() { return 320; }

export { foo, X, Y, a, unused, deeplyNested, pad1, pad320 };
