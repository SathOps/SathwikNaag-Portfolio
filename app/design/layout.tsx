import '@fontsource/old-standard-tt/400.css';
import '@fontsource/old-standard-tt/700.css';
import '@fontsource/unifrakturmaguntia';
import '@fontsource-variable/cormorant-garamond';
import '@fontsource-variable/cormorant-garamond/wght-italic.css';
import '@fontsource/pinyon-script';
import '@fontsource/anton';
import '@fontsource/bebas-neue';
import '@fontsource-variable/nunito';
import Cursor from '@/components/ui/Cursor';
import { LightboxProvider } from '@/components/groups/Lightbox';
import DesignBot from '@/components/chat/DesignBot';
import { getChatKnowledge, getProfile } from '@/lib/content';

export default async function DesignLayout({ children }: { children: React.ReactNode }) {
  const [docs, p] = await Promise.all([getChatKnowledge('design'), getProfile()]);
  return (
    <div className="bg-[#f7f0e1] font-grotesk text-black">
      <Cursor variant="ink" />
      <LightboxProvider tone="comic">{children}</LightboxProvider>
      <DesignBot docs={docs} whatsapp={p.whatsapp} />
    </div>
  );
}
