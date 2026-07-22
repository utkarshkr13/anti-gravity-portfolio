import asyncio
import os
import sys

# Add project path to system path
sys.path.append(r"d:\Utkarsh\Python\Side_Quest\Portfolio")
sys.path.append(r"d:\Utkarsh\Python\Side_Quest\Portfolio\tests")

from server import start_server, stop_server
from cdp_client import CDPClient

async def main():
    server = start_server(8003)
    client = CDPClient(port=9227)
    await client.start()
    try:
        await client.navigate("http://localhost:8003/index.html")
        
        # Wait for loader
        await asyncio.sleep(2)
        
        # Set viewport to mobile (375x812)
        await client.set_viewport(375, 812)
        await asyncio.sleep(0.5)
        
        # Open modal
        await client.click(".btn-case-study[data-project='sap-tracker']")
        await asyncio.sleep(0.5)
        
        # Get bounding boxes
        close_box = await client.get_box_model("#modalCloseBtn")
        badge_box = await client.get_box_model("#modalBadge")
        title_box = await client.get_box_model("#modalTitle")
        container_box = await client.get_box_model(".modal-container")
        wrapper_box = await client.get_box_model(".modal-wrapper")
        
        print("Wrapper Box:", wrapper_box)
        print("Container Box:", container_box)
        print("Close Box:", close_box)
        print("Badge Box:", badge_box)
        print("Title Box:", title_box)
        
        # Check coordinates
        if close_box and badge_box and title_box:
            c_content = close_box["content"]
            b_content = badge_box["content"]
            t_content = title_box["content"]
            
            # content box is [x0, y0, x1, y1, x2, y2, x3, y3]
            # where:
            # x0, y0 is top-left
            # x1, y1 is top-right
            # x2, y2 is bottom-right
            # x3, y3 is bottom-left
            
            print(f"Close Button: X={c_content[0]} to {c_content[2]}, Y={c_content[1]} to {c_content[5]}")
            print(f"Badge: X={b_content[0]} to {b_content[2]}, Y={b_content[1]} to {b_content[5]}")
            print(f"Title: X={t_content[0]} to {t_content[2]}, Y={t_content[1]} to {t_content[5]}")
            
            # Check overlap
            c_left, c_right = c_content[0], c_content[2]
            c_top, c_bottom = c_content[1], c_content[5]
            
            b_left, b_right = b_content[0], b_content[2]
            b_top, b_bottom = b_content[1], b_content[5]
            
            t_left, t_right = t_content[0], t_content[2]
            t_top, t_bottom = t_content[1], t_content[5]
            
            badge_overlap = not (c_right < b_left or c_left > b_right or c_bottom < b_top or c_top > b_bottom)
            title_overlap = not (c_right < t_left or c_left > t_right or c_bottom < t_top or c_top > t_bottom)
            
            print(f"Badge overlaps close button: {badge_overlap}")
            print(f"Title overlaps close button: {title_overlap}")
            
    finally:
        await client.close()
        stop_server(server)

if __name__ == "__main__":
    asyncio.run(main())
