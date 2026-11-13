/** Tra ảnh lá bài tarot theo tên tiếng Anh mà bộ máy trả về (LaBai.tenAnh). */
import manifest from '../web/assets/menh-ly-3d/tarot/deck-manifest.json';

const SO: Record<string, string> = { Two: '2', Three: '3', Four: '4', Five: '5', Six: '6', Seven: '7', Eight: '8', Nine: '9', Ten: '10' };
const BANG = new Map((manifest.cards as { file: string; name_en: string }[]).map((c) => [c.name_en.toLowerCase(), c.file]));

/** Trả về đường dẫn tương đối trong assets/menh-ly-3d/tarot/, hoặc null nếu không có ảnh. */
export function fileBai(tenAnh: string): string | null {
  const ten = tenAnh.replace(/^(Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten) of/, (_m, w: string) => `${SO[w]} of`);
  return BANG.get(ten.toLowerCase()) ?? null;
}
