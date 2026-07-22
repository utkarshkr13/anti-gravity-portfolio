import asyncio
import os
import sys

# Add portfolio root to path to import server and cdp_client
sys.path.append(r"d:\Utkarsh\Python\Side_Quest\Portfolio")
sys.path.append(r"d:\Utkarsh\Python\Side_Quest\Portfolio\tests")

from server import start_server, stop_server
from cdp_client import CDPClient

async def main():
    server = None
    client = None
    try:
        # Start server
        server = start_server(8001)
        
        # Start CDP Client
        client = CDPClient(port=9223)
        await client.start()
        
        # Navigate
        await client.navigate("http://localhost:8001/index.html")
        
        # Wait for loader
        for i in range(80):
            is_loader_gone = await client.eval_js(
                "document.getElementById('pageLoader') ? document.getElementById('pageLoader').style.display === 'none' : true"
            )
            if is_loader_gone:
                break
            await asyncio.sleep(0.1)
        
        # Set viewport to mobile (375x812)
        await client.set_viewport(375, 812)
        await asyncio.sleep(0.5)
        
        # Query features
        cards_info = await client.eval_js("""
            Array.from(document.querySelectorAll('.project-card')).map((card, idx) => {
                const img = card.querySelector('.project-card-image');
                const body = card.querySelector('.project-card-body');
                const isFeatured = card.classList.contains('featured');
                const cardRect = card.getBoundingClientRect();
                const imgRect = img ? img.getBoundingClientRect() : { width: 0, height: 0 };
                const bodyRect = body ? body.getBoundingClientRect() : { width: 0, height: 0 };
                const computedImg = img ? window.getComputedStyle(img) : {};
                return {
                    index: idx,
                    isFeatured,
                    cardHeight: cardRect.height,
                    cardWidth: cardRect.width,
                    imgHeight: imgRect.height,
                    imgWidth: imgRect.width,
                    imgMinHeight: computedImg.minHeight || '',
                    bodyHeight: bodyRect.height,
                    bodyWidth: bodyRect.width,
                    imgAspectRatio: computedImg.aspectRatio || '',
                    cardFlexDir: window.getComputedStyle(card).flexDirection
                };
            })
        """)
        
        print("MOBILE VIEWPORT (375px) RESULTS:")
        for info in cards_info:
            role = "Featured" if info['isFeatured'] else "Standard"
            print(f"Card {info['index']} ({role}):")
            print(f"  Flex Direction: {info['cardFlexDir']}")
            print(f"  Card: {info['cardWidth']}px x {info['cardHeight']}px")
            if info['imgWidth'] > 0:
                print(f"  Image: {info['imgWidth']}px x {info['imgHeight']}px (aspect-ratio: {info['imgAspectRatio']}, min-height: {info['imgMinHeight']})")
            else:
                print("  No Image")
            print(f"  Body: {info['bodyWidth']}px x {info['bodyHeight']}px")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if client:
            try:
                await client.close()
            except:
                pass
        if server:
            try:
                stop_server(server)
            except:
                pass

if __name__ == "__main__":
    asyncio.run(main())
