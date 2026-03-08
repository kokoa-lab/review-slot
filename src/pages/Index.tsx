import ReviewSlotMachine from "@/components/ReviewSlotMachine";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      {/* Title */}
      <div className="text-center mb-6 sm:mb-10 animate-fade-in">
        <h1 className="font-pixel text-base sm:text-xl md:text-2xl lg:text-3xl text-neon-green mb-3 sm:mb-4 leading-relaxed">
          ReviewSlot
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
          슬롯머신을 돌려서 코드리뷰 코멘트를 생성하세요.<br />
          <span className="text-neon-cyan text-xs">톤 × 내용 × 액션 = 100가지 조합</span>
        </p>
      </div>

      {/* Slot Machine */}
      <ReviewSlotMachine />

      {/* Footer */}
      <p className="mt-12 text-xs text-muted-foreground font-pixel animate-pulse-glow">
        INSERT COIN ▶ PRESS SPIN
      </p>
    </div>
  );
};

export default Index;
